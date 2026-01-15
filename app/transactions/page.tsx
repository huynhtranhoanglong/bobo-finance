"use client"

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import TransactionItem from "@/components/transaction-item";
import TransactionFilters from "@/components/transaction-filters";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { UserNav } from "@/components/user-nav";
import AddTransactionDialog from "@/components/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 10;

function TransactionsPageContent() {
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [funds, setFunds] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // Fetch data on mount and when search params change
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const supabase = createClient();

            // Get user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // Get wallets
            const { data: walletsData } = await supabase
                .from("wallets")
                .select("id, name");
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

            // Get filter params
            const q = searchParams.get("q") || "";
            const wallet_id = searchParams.get("wallet") || "";
            const type = searchParams.get("type") || "";
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
            if (from_date) {
                query = query.gte("date", new Date(from_date).toISOString());
            }
            if (to_date) {
                // Add 1 day to include the entire to_date
                const toDateEnd = new Date(to_date);
                toDateEnd.setDate(toDateEnd.getDate() + 1);
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
            setDisplayCount(ITEMS_PER_PAGE); // Reset pagination when filters change
        }

        fetchData();
    }, [searchParams]);

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    };

    const displayedTransactions = transactions.slice(0, displayCount);
    const hasMore = displayCount < transactions.length;
    const remainingCount = transactions.length - displayCount;

    return (
        <main className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-bold">Lịch sử giao dịch</h1>
                </div>
                <div className="flex items-center gap-2">
                    <PrivacyToggle />
                    {user && <UserNav email={user.email || 'User'} />}
                </div>
            </div>

            {/* Filters */}
            <TransactionFilters wallets={wallets || []} />

            {/* Transactions List */}
            {loading ? (
                <div className="text-center text-gray-500 py-10">Đang tải...</div>
            ) : (
                <>
                    <div className="space-y-3">
                        {displayedTransactions.map((t: any) => (
                            <TransactionItem
                                key={t.id}
                                transaction={t}
                                wallets={wallets || []}
                            />
                        ))}

                        {transactions.length === 0 && (
                            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border shadow-sm">
                                Không tìm thấy giao dịch nào.
                            </div>
                        )}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={handleLoadMore}
                                variant="outline"
                                className="rounded-xl h-12 px-6 gap-2"
                                style={{ borderColor: '#598c58', color: '#598c58' }}
                            >
                                Xem thêm ({remainingCount} giao dịch nữa)
                                <ChevronDown size={18} />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* FAB Button */}
            <AddTransactionDialog
                wallets={wallets || []}
                debts={debts || []}
                funds={funds || []}
            />
        </main>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={
            <div className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">
                <div className="text-center text-gray-500 py-10">Đang tải...</div>
            </div>
        }>
            <TransactionsPageContent />
        </Suspense>
    );
}