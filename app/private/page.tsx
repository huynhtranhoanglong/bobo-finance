import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Plus } from "lucide-react";

// Components
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import WalletCard from "@/components/wallet-card";
import { AppVersion } from "@/components/app-version";
import CreateWalletDialog from "@/components/create-wallet-dialog";
import { COLOR_BRAND } from "@/utils/colors";
import {
    LABEL_PRIVATE_DASHBOARD_TITLE, LABEL_PRIVATE_DASHBOARD_EMPTY, LABEL_PRIVATE_DASHBOARD_NOTE,
    LABEL_TOTAL_PRIVATE_BALANCE, LABEL_CREATE_PRIVATE_WALLET, LABEL_SECTION_WALLETS
} from "@/utils/labels";

export default async function PrivateDashboardPage() {
    const supabase = await createClient();

    // Check user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Check if user has family (if not, redirect to main dashboard)
    const familyId = await supabase.rpc("get_user_family_id");
    if (!familyId.data) {
        // User doesn't have family, no need for private dashboard
        redirect("/");
    }

    // Get private dashboard data
    const { data: privateData, error } = await supabase.rpc("get_private_dashboard_data");

    if (error) {
        console.error("Error fetching private dashboard:", error);
    }

    const totalBalance = privateData?.total_balance || 0;
    const wallets = privateData?.wallets || [];
    const walletCount = privateData?.wallet_count || 0;

    // Get funds list for CreateWalletDialog
    const { data: fundsData } = await supabase.from("funds").select("id, name").eq("user_id", user.id);
    const fundsList = fundsData || [];

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
                    <h1 className="text-xl font-bold text-gray-800">{LABEL_PRIVATE_DASHBOARD_TITLE}</h1>
                </div>
            </div>

            {/* Note about private wallets */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                    🔒 {LABEL_PRIVATE_DASHBOARD_NOTE}
                </p>
            </div>

            {/* Total Private Balance */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
                <p className="text-gray-500 text-sm mb-1">{LABEL_TOTAL_PRIVATE_BALANCE}</p>
                <div style={{ color: COLOR_BRAND }}>
                    <PrivacyAmount
                        amount={totalBalance}
                        className="text-3xl font-bold"
                    />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                    {walletCount} ví riêng tư
                </p>
            </div>

            {/* Private Wallets List */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">💳 {LABEL_SECTION_WALLETS}</h2>
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
                    <p className="text-gray-500 mb-4">{LABEL_PRIVATE_DASHBOARD_EMPTY}</p>
                    <CreateWalletDialog funds={fundsList} hasFamily={true} defaultPrivate={true} />
                </div>
            )}

            {/* Footer */}
            <AppVersion />
        </main>
    );
}
