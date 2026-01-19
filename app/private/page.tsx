import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PrivateDashboardClient from "@/components/private-dashboard-client";

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
        <PrivateDashboardClient
            totalBalance={totalBalance}
            wallets={wallets}
            walletCount={walletCount}
            fundsList={fundsList}
        />
    );
}
