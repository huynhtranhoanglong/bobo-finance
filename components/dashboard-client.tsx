"use client"

import Link from "next/link";
import { List } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";

// Components
import GreetingHeader from "@/components/greeting-header";
import NetWorthSection from "@/components/net-worth-section";
import FinancialProgress from "@/components/financial-progress";
import MonthlyStats from "@/components/monthly-stats";
import FundGroup from "@/components/fund-group";
import DebtCard from "@/components/debt-card";
import CreateWalletDialog from "@/components/create-wallet-dialog";
import CreateDebtDialog from "@/components/create-debt-dialog";
import AddTransactionDialog from "@/components/add-transaction-dialog";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { AppVersion } from "@/components/app-version";

interface DashboardClientProps {
    user: any;
    profile: any;
    monthlyStats: any;
    metrics: any;
    wallets: any[];
    debts: any[];
    fundsList: any[];
    familyInfo: any;
    sortedGroups: any[];
    hasPrivateWallets: boolean;
}

export default function DashboardClient({
    user,
    profile,
    monthlyStats,
    metrics,
    wallets,
    debts,
    fundsList,
    familyInfo,
    sortedGroups,
    hasPrivateWallets,
}: DashboardClientProps) {
    const { t } = useTranslation();

    return (
        <>
            <PullToRefresh>
                <main className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">

                    {/* Greeting Header */}
                    <GreetingHeader
                        userEmail={user?.email || 'User'}
                        userName={profile?.display_name}
                        hasFamily={!!familyInfo}
                        hasPrivateWallets={hasPrivateWallets}
                    />

                    {/* Net Worth Section */}
                    <NetWorthSection netWorth={metrics?.net_worth || 0} />

                    {/* Financial Progress */}
                    <FinancialProgress metrics={metrics} />

                    {/* Stats Tháng Này */}
                    <MonthlyStats stats={monthlyStats} />

                    {/* VÍ TIỀN (GOM NHÓM THEO QUỸ) */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">💳 {t.LABEL_SECTION_WALLETS}</h2>
                        <CreateWalletDialog funds={fundsList || []} hasFamily={!!familyInfo} />
                    </div>
                    <div className="mb-6">
                        {sortedGroups.map((group) => (
                            <FundGroup
                                key={group.name}
                                fundName={group.name}
                                totalBalance={group.balance}
                                wallets={group.wallets}
                                fundsList={fundsList}
                                minMonthlySpend={metrics?.min_monthly_spend}
                            />
                        ))}
                        {wallets?.length === 0 && <p className="text-gray-500 italic">{t.LABEL_NO_WALLETS}</p>}
                    </div>

                    {/* DEBTS SECTION */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">💳 {t.LABEL_SECTION_DEBTS}</h2>
                        <CreateDebtDialog wallets={wallets || []} />
                    </div>
                    <div className="space-y-3 mb-6">
                        {debts?.map((debt: any) => (
                            <DebtCard key={debt.id} debt={debt} wallets={wallets || []} />
                        ))}
                        {(!debts || debts.length === 0) && (
                            <div className="p-6 text-center bg-white rounded-2xl border shadow-sm">
                                <p className="text-lg mb-1">🎉</p>
                                <p style={{ color: COLORS.brand }} className="font-medium">{t.LABEL_NO_DEBTS_CONGRATS}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <Link
                            href="/transactions"
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
                        >
                            <List size={20} style={{ color: COLORS.brand }} />
                            <span className="text-sm font-medium" style={{ color: COLORS.brand }}>{t.LABEL_TRANSACTION_HISTORY}</span>
                        </Link>
                    </div>

                    {/* Build Version Indicator */}
                    <AppVersion />

                </main>
            </PullToRefresh>

            {/* NÚT FAB (THÊM GIAO DỊCH) */}
            <AddTransactionDialog wallets={wallets || []} debts={debts || []} funds={fundsList || []} />
        </>
    );
}
