"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Plus, Calendar, User, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { COLOR_BRAND } from "@/utils/colors";
import AddTransactionDrawer from "@/components/dialogs/add-transaction-drawer";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [openAdd, setOpenAdd] = useState(false);

    // Data for AddTransactionDialog
    const [wallets, setWallets] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [funds, setFunds] = useState<any[]>([]);
    const [activeEvents, setActiveEvents] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Auto-hide on scroll
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if scrolling up or at the top
            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsVisible(true);
            }
            // Hide if scrolling down and not at the top
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Hide BottomNav on auth pages and invite pages
    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/invite") ||
        pathname === "/auth/callback"
    ) {
        return null;
    }

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname.startsWith(path)) return true;
        return false;
    };

    // Fetch data when opening dialog (lazy load) or periodically
    const fetchData = async () => {
        setLoadingData(true);
        const supabase = createClient();

        const [
            { data: walletsData },
            { data: debtsData },
            { data: fundsData },
            { data: eventsData }
        ] = await Promise.all([
            supabase.from("wallets").select("id, name, balance"),
            supabase.from("debts").select("id, name, remaining_amount, total_amount").eq('type', 'payable').gt('remaining_amount', 0),
            supabase.from("funds").select("id, name"),
            supabase.rpc('get_active_events')
        ]);

        setWallets(walletsData || []);
        setDebts(debtsData || []);
        setFunds(fundsData || []);
        setActiveEvents(eventsData || []);
        setLoadingData(false);
    };

    // Reload data when dialog opens
    const handleOpenAdd = () => {
        fetchData();
        setOpenAdd(true);
    };

    // Custom Trigger for Add Button
    const AddButtonTrigger = (
        <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center -mt-6 p-2 rounded-full border-4 border-[#FAFAFA] shadow-lg transition-transform hover:scale-105 active:scale-95 z-50"
            style={{
                backgroundColor: COLOR_BRAND,
                boxShadow: "0 10px 25px -5px rgba(89, 140, 88, 0.5)"
            }}
        >
            <Plus className="text-white w-8 h-8" strokeWidth={2.5} />
        </button>
    );

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-0 pointer-events-none transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-[150%]"
                }`}
        >
            {/* Glass Container */}
            <div className="mx-auto max-w-lg pointer-events-auto">
                <nav className="flex items-center justify-between px-2 h-[4.5rem] rounded-[2rem] bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50">

                    {/* 1. HOME */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-300 ${isActive("/") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <Home size={24} strokeWidth={isActive("/") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{t.LABEL_HOME}</span>
                    </Link>

                    {/* 2. TRANSACTIONS */}
                    <Link
                        href="/transactions"
                        className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-300 ${isActive("/transactions") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <List size={24} strokeWidth={isActive("/transactions") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{t.LABEL_TRANSACTION_HISTORY.split(' ')[0]}</span>
                    </Link>

                    {/* 3. ADD BUTTON (CENTER) */}
                    <div className="relative w-16 flex justify-center">
                        <AddTransactionDrawer
                            wallets={wallets}
                            debts={debts}
                            funds={funds}
                            activeEvents={activeEvents}
                            trigger={AddButtonTrigger}
                            onSuccess={() => {
                                // Trigger global event for other components to refresh
                                window.dispatchEvent(new Event('transaction-added'));
                                // Also refresh local data
                                fetchData();
                            }}
                        />
                    </div>

                    {/* 4. EVENTS */}
                    <Link
                        href="/events"
                        className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-300 ${isActive("/events") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <Calendar size={24} strokeWidth={isActive("/events") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{t.LABEL_EVENTS}</span>
                    </Link>

                    {/* 5. ACCOUNT */}
                    <Link
                        href="/account"
                        className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-300 ${isActive("/account") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        <User size={24} strokeWidth={isActive("/account") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{t.LABEL_ACCOUNT}</span>
                    </Link>

                </nav>
            </div>
        </div>
    );
}
