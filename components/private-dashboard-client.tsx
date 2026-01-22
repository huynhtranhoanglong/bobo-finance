"use client"

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

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
        <main className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex flex-col pt-safe">
            {/* Ambient Background - Purple & Pink Theme for "Private" feel */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[80px] mix-blend-multiply opacity-70 animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-100/40 rounded-full blur-[60px] mix-blend-multiply opacity-60 animate-delayed-float" />
            </div>

            <div className="max-w-lg mx-auto w-full p-4 md:p-8 pb-32 relative z-10">
                {/* Header */}
                <PageHeader
                    title={t.LABEL_PRIVATE_DASHBOARD_TITLE}
                    showBackButton={true}
                    sticky={false}
                    className="px-0"
                    rightContent={<Lock className="w-5 h-5 text-purple-400" />}
                />

                {/* Note about private wallets - Glass Card */}
                <div className="mb-8 p-4 bg-purple-50/50 border border-purple-100/50 backdrop-blur-sm rounded-2xl flex gap-3 items-start shadow-sm">
                    <span className="text-xl">🔒</span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {t.LABEL_PRIVATE_DASHBOARD_NOTE}
                    </p>
                </div>

                {/* Total Private Balance - Glass Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 mb-8 shadow-sm border border-white/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent pointer-events-none" />

                    <div className="relative text-center">
                        <p className="text-slate-500 font-medium mb-2 uppercase tracking-wider text-xs">{t.LABEL_TOTAL_PRIVATE_BALANCE}</p>
                        <div className="flex justify-center items-baseline gap-1">
                            <PrivacyAmount
                                amount={totalBalance}
                                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500"
                            />
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/50 px-4 py-1.5 rounded-full border border-white/60 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <p className="text-slate-500 text-xs font-medium">
                                {walletCount} {t.LABEL_PRIVATE_WALLETS_COUNT}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Private Wallets List */}
                <div className="flex justify-between items-end mb-6 px-1">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        💳 {t.LABEL_SECTION_WALLETS}
                    </h2>
                    <CreateWalletDialog funds={fundsList} hasFamily={true} defaultPrivate={true} />
                </div>

                {wallets.length > 0 ? (
                    <div className="space-y-4">
                        {wallets.map((wallet: any) => (
                            <div key={wallet.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                                <WalletCard
                                    wallet={wallet}
                                    funds={fundsList}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/40 p-10 text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Lock className="h-8 w-8 text-purple-300" />
                        </div>
                        <p className="text-slate-500 mb-6 font-medium">{t.LABEL_PRIVATE_DASHBOARD_EMPTY}</p>
                        <CreateWalletDialog funds={fundsList} hasFamily={true} defaultPrivate={true} />
                    </div>
                )}

                {/* Footer */}
                <AppVersion light={false} className="mt-12 opacity-50" />
            </div>
        </main>
    );
}
