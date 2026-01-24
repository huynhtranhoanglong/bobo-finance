"use client"

import Link from "next/link";
import { ArrowRightLeft, List } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { COLORS } from "@/utils/colors";

// Components
import GreetingHeader from "@/components/dashboard/greeting-header";
import NetWorthSection from "@/components/dashboard/net-worth-section";
import FinancialProgress from "@/components/dashboard/financial-progress";
import MonthlyStats from "@/components/dashboard/monthly-stats";
import FundGroup from "@/components/dashboard/fund-group";
import DebtCard from "@/components/cards/debt-card";
import { DisablePrivacyOnMount } from "@/components/ui/disable-privacy";

// Demo Mode Data
const DEMO_METRICS = {
    net_worth: 125000000,
    total_assets: 150000000,
    total_debts: 25000000,
    min_monthly_spend: 8000000,
    std_monthly_spend: 12000000,
    safety_target: 2400000000,
    freedom_target: 3600000000,
    safety_progress: 5.2,
    freedom_progress: 3.5
};

const DEMO_MONTHLY_STATS = {
    income: 25000000,
    expense: 18000000,
    remaining: 7000000,
    breakdown: { must_have: 10000000, nice_to_have: 6000000, waste: 2000000 },
    min_spend: 8000000,
    std_spend: 12000000,
    has_debt: true
};

const DEMO_FUNDS = [
    { id: "demo-1", name: "Daily Expenses" },
    { id: "demo-2", name: "Emergency Fund" },
    { id: "demo-3", name: "Sinking Fund" },
    { id: "demo-4", name: "Investment Fund" }
];

const DEMO_WALLETS = [
    { id: "w1", name: "Tiền mặt", balance: 5000000, fund_id: "demo-1", funds: { id: "demo-1", name: "Daily Expenses" } },
    { id: "w2", name: "TPBank", balance: 45000000, fund_id: "demo-1", funds: { id: "demo-1", name: "Daily Expenses" } },
    { id: "w3", name: "Quỹ dự phòng", balance: 50000000, fund_id: "demo-2", funds: { id: "demo-2", name: "Emergency Fund" } },
    { id: "w4", name: "Mua xe", balance: 30000000, fund_id: "demo-3", funds: { id: "demo-3", name: "Sinking Fund" } },
    { id: "w5", name: "Chứng khoán", balance: 20000000, fund_id: "demo-4", funds: { id: "demo-4", name: "Investment Fund" } }
];

const DEMO_DEBTS = [
    { id: "d1", name: "Vay mua laptop", remaining_amount: 15000000, total_amount: 25000000, type: 'payable' },
    { id: "d2", name: "Nợ thẻ tín dụng", remaining_amount: 10000000, total_amount: 10000000, type: 'payable' }
];

export default function DemoDashboard() {
    const { t } = useTranslation();

    // Grouping wallets for demo
    const demoFundGroups: Record<string, { name: string, balance: number, wallets: any[] }> = {};
    DEMO_FUNDS.forEach((fund) => {
        demoFundGroups[fund.name] = { name: fund.name, balance: 0, wallets: [] };
    });
    DEMO_WALLETS.forEach((wallet) => {
        const fundName = wallet.funds?.name;
        if (fundName && demoFundGroups[fundName]) {
            demoFundGroups[fundName].wallets.push(wallet);
            demoFundGroups[fundName].balance += wallet.balance;
        }
    });
    const demoSortedGroups = Object.values(demoFundGroups).sort((a, b) => {
        const order = ["Daily Expenses", "Emergency Fund", "Sinking Fund", "Investment Fund"];
        return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return (
        <main className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">
            {/* Tự động tắt Privacy Mode trong Demo */}
            <DisablePrivacyOnMount />

            {/* DEMO MODE BANNER */}
            <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-center">
                <p className="text-amber-800 text-sm font-medium">
                    {t.LABEL_DEMO_BANNER} | <Link href="/login" className="underline font-bold">{t.LABEL_DEMO_LOGIN_CTA}</Link>
                </p>
            </div>

            {/* Greeting Header */}
            <GreetingHeader showControls={false} />

            {/* Net Worth Section */}
            <NetWorthSection netWorth={DEMO_METRICS.net_worth} />

            {/* Financial Progress */}
            <FinancialProgress metrics={DEMO_METRICS} />

            {/* Stats Tháng Này */}
            <MonthlyStats stats={DEMO_MONTHLY_STATS} />

            <h2 className="text-lg font-bold mb-4 text-gray-800">💳 {t.LABEL_SECTION_WALLETS}</h2>
            <div className="mb-6">
                {demoSortedGroups.map((group) => (
                    <FundGroup
                        key={group.name}
                        fundName={group.name}
                        totalBalance={group.balance}
                        wallets={group.wallets}
                        fundsList={DEMO_FUNDS}
                        minMonthlySpend={DEMO_MONTHLY_STATS.min_spend}
                    />
                ))}
            </div>

            {/* DEBTS SECTION */}
            <h2 className="text-lg font-bold mb-4 text-gray-800">💳 {t.LABEL_SECTION_DEBTS}</h2>
            <div className="space-y-3 mb-6">
                {DEMO_DEBTS.map((debt) => (
                    <DebtCard key={debt.id} debt={debt} wallets={DEMO_WALLETS} />
                ))}
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border shadow-sm cursor-not-allowed">
                    <List size={20} style={{ color: COLORS.neutral }} />
                    <span className="text-sm font-medium" style={{ color: COLORS.neutral }}>{t.LABEL_TRANSACTION_HISTORY}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border shadow-sm cursor-not-allowed">
                    <ArrowRightLeft size={20} style={{ color: COLORS.neutral }} />
                    <span className="text-sm font-medium" style={{ color: COLORS.neutral }}>{t.LABEL_DEBT_MANAGEMENT}</span>
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">Build: v1.5.0 (Demo Mode)</p>
        </main>
    );
}
