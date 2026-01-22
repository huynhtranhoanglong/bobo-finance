"use client"

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import TransactionItem from "@/components/transaction-item";
import TransactionFilters from "@/components/transaction-filters";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { UserNav } from "@/components/user-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { TransactionListSkeleton } from "@/components/ui/skeleton";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { AppVersion } from "@/components/app-version";
import { COLOR_BRAND } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

const ITEMS_PER_PAGE = 10;

function TransactionsPageContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [funds, setFunds] = useState<any[]>([]);
    const [activeEvents, setActiveEvents] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [staticDataLoaded, setStaticDataLoaded] = useState(false);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Callback to refresh transactions only (not static data)
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Listen for transaction-added event from BottomNav
    useEffect(() => {
        window.addEventListener('transaction-added', handleRefresh);
        return () => window.removeEventListener('transaction-added', handleRefresh);
    }, []);

    // Fetch static data ONCE on mount (wallets, debts, funds, user)
    useEffect(() => {
        async function fetchStaticData() {
            const supabase = createClient();

            // Get user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // Get wallets
            const { data: walletsData } = await supabase
                .from("wallets")
                .select("id, name, balance");
            setWallets(walletsData || []);

            // Get debts (for FAB)
            const { data: debtsData } = await supabase
                .from("debts")
                .select("id, name, remaining_amount, total_amount")
                .eq('type', 'payable')
                .gt('remaining_amount', 0);
            setDebts(debtsData || []);

            // Get funds (for FAB)
            const { data: fundsData } = await supabase.from("funds").select("id, name");
            setFunds(fundsData || []);

            // Get active events (v1.6.2)
            const { data: eventsData } = await supabase.rpc('get_active_events');
            setActiveEvents(eventsData || []);

            setStaticDataLoaded(true);
        }

        fetchStaticData();
    }, []); // Empty dependency = only run on mount

    // Fetch transactions when filters change or refresh triggered
    useEffect(() => {
        if (!staticDataLoaded) return; // Wait for static data first

        async function fetchTransactions() {
            setLoading(true);
            const supabase = createClient();

            // Get filter params
            const q = searchParams.get("q") || "";
            const wallet_id = searchParams.get("wallet") || "";
            const type = searchParams.get("type") || "";
            const event_id = searchParams.get("event") || "";
            const sort = searchParams.get("sort") || "date_desc";
            const from_date = searchParams.get("from_date") || "";
            const to_date = searchParams.get("to_date") || "";

            // Build query
            let query = supabase
                .from("transactions")
                .select(`
                    *,
                    wallets:wallet_id ( name ),
                    debts:related_debt_id ( name )
                `);

            // Apply filters
            if (q) {
                query = query.ilike("note", `%${q}%`);
            }
            if (wallet_id && wallet_id !== "all") {
                query = query.eq("wallet_id", wallet_id);
            }
            if (type && type !== "all") {
                query = query.eq("type", type);
            }
            // v1.6.3: Event filter
            if (event_id && event_id !== "all") {
                query = query.eq("event_id", event_id);
            }
            if (from_date) {
                // FIX v1.2.6: Append T00:00:00 to force Local Time 00:00:00
                const fromDateLocal = new Date(from_date + "T00:00:00");
                query = query.gte("date", fromDateLocal.toISOString());
            }
            if (to_date) {
                // FIX v1.2.6: Append T00:00:00 to force Local Time 00:00:00
                const toDateEnd = new Date(to_date + "T00:00:00");
                toDateEnd.setDate(toDateEnd.getDate() + 1); // Add 1 day to get End of Day (00:00 next day)
                query = query.lt("date", toDateEnd.toISOString());
            }

            // Apply sorting
            if (sort === "date_asc") {
                query = query.order("date", { ascending: true });
            } else if (sort === "amount_desc") {
                query = query.order("amount", { ascending: false });
            } else if (sort === "amount_asc") {
                query = query.order("amount", { ascending: true });
            } else {
                query = query.order("date", { ascending: false });
            }

            const { data: transactionsData } = await query;
            setTransactions(transactionsData || []);
            setLoading(false);
            setDisplayCount(ITEMS_PER_PAGE);
        }

        fetchTransactions();
    }, [searchParams, refreshTrigger, staticDataLoaded]); // Watch filters and refresh

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    };

    const displayedTransactions = transactions.slice(0, displayCount);
    const hasMore = displayCount < transactions.length;
    const remainingCount = transactions.length - displayCount;

    return (
        <>
            <PullToRefresh>
                <main className="relative isolate min-h-screen bg-[#FAFAFA] overflow-hidden">
                    {/* Background Ambient Orbs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px] -z-10 mt-20" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] -z-10" />

                    <div className="max-w-2xl mx-auto p-4 md:p-8 pb-32">
                        {/* Header */}
                        <PageHeader title={t.LABEL_TRANSACTION_HISTORY} user={user} className="px-0 pt-0" />

                        {/* Filters - Now Soft UI */}
                        <TransactionFilters wallets={wallets || []} events={activeEvents} />

                        {/* Transactions List */}
                        {loading ? (
                            <TransactionListSkeleton />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {displayedTransactions.map((t: any) => (
                                        <TransactionItem
                                            key={t.id}
                                            transaction={t}
                                            wallets={wallets || []}
                                            activeEvents={activeEvents}
                                            onSuccess={handleRefresh}
                                        />
                                    ))}

                                    {transactions.length === 0 && (
                                        <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/40 shadow-sm">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-200/50" />
                                            </div>
                                            <p className="text-slate-500 font-medium">{t.LABEL_NO_TRANSACTIONS}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="flex justify-center mt-10">
                                        <Button
                                            onClick={handleLoadMore}
                                            variant="outline"
                                            className="rounded-2xl h-12 px-8 gap-2 bg-white/60 hover:bg-white border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            {t.LABEL_LOAD_MORE_TRANSACTIONS} <span className="opacity-60">({remainingCount} {t.LABEL_TRANSACTIONS_MORE})</span>
                                            <ChevronDown size={18} />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        <AppVersion />
                    </div>
                </main>
            </PullToRefresh>
        </>
    );
}

export default function TransactionsPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
                <div className="text-center text-slate-400 font-medium animate-pulse">{t.LABEL_LOADING_PAGE}</div>
            </div>
        }>
            <TransactionsPageContent />
        </Suspense>
    );
}