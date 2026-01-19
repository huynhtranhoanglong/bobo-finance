"use client"

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

import { PrivacyAmount } from "@/components/ui/privacy-amount";
import WalletCard from "@/components/wallet-card";
import { AppVersion } from "@/components/app-version";
import CreateWalletDialog from "@/components/create-wallet-dialog";
import { COLOR_BRAND } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

interface PrivateDashboardClientProps {
    totalBalance: number;
    wallets: any[];
    walletCount: number;
    fundsList: any[];
}

export default function PrivateDashboardClient({
    totalBalance,
    wallets,
    walletCount,
    fundsList
}: PrivateDashboardClientProps) {
    const { t } = useTranslation();

    return (
        <main className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">
            {/* Header with Back button */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/"
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" style={{ color: COLOR_BRAND }} />
                    <h1 className="text-xl font-bold text-gray-800">{t.LABEL_PRIVATE_DASHBOARD_TITLE}</h1>
                </div>
            </div>

            {/* Note about private wallets */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                    🔒 {t.LABEL_PRIVATE_DASHBOARD_NOTE}
                </p>
            </div>

            {/* Total Private Balance */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
                <p className="text-gray-500 text-sm mb-1">{t.LABEL_TOTAL_PRIVATE_BALANCE}</p>
                <div style={{ color: COLOR_BRAND }}>
                    <PrivacyAmount
                        amount={totalBalance}
                        className="text-3xl font-bold"
                    />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                    {walletCount} {t.LABEL_PRIVATE_WALLETS_COUNT}
                </p>
            </div>

            {/* Private Wallets List */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">💳 {t.LABEL_SECTION_WALLETS}</h2>
                <CreateWalletDialog funds={fundsList} hasFamily={true} defaultPrivate={true} />
            </div>

            {wallets.length > 0 ? (
                <div className="space-y-3 mb-6">
                    {wallets.map((wallet: any) => (
                        <WalletCard
                            key={wallet.id}
                            wallet={wallet}
                            funds={fundsList}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border shadow-sm p-8 text-center mb-6">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">{t.LABEL_PRIVATE_DASHBOARD_EMPTY}</p>
                    <CreateWalletDialog funds={fundsList} hasFamily={true} defaultPrivate={true} />
                </div>
            )}

            {/* Footer */}
            <AppVersion />
        </main>
    );
}
