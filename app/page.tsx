import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRightLeft, List } from "lucide-react";

// Import các Components
import { ensureDefaultFunds } from "@/app/actions/ensure-funds";
import { DisablePrivacyOnMount } from "@/components/ui/disable-privacy";
import DashboardClient from "@/components/dashboard-client";
import DemoDashboard from "@/components/demo-dashboard";
import { DEFAULT_TIMEZONE } from "@/utils/timezone";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const isDemo = params.demo === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.rpc('get_my_profile');

  // Nếu DEMO MODE -> Render Demo Dashboard
  if (isDemo) {
    return <DemoDashboard />;
  }

  // ===================== REAL USER MODE =====================
  // Đảm bảo user có đủ 4 funds mặc định
  await ensureDefaultFunds();

  // Chuẩn bị thời gian (Tháng hiện tại)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get user timezone from cookie
  const cookieStore = await cookies();
  const userTimezone = cookieStore.get("timezone")?.value || DEFAULT_TIMEZONE;

  // Gộp tất cả API thành 1 RPC call duy nhất
  const { data: dashboardData } = await supabase.rpc('get_dashboard_data', {
    p_month: currentMonth,
    p_year: currentYear,
    p_timezone: userTimezone
  });

  // Extract data từ response
  const monthlyStats = dashboardData?.monthly_stats;
  const wallets = dashboardData?.wallets || [];
  const debts = dashboardData?.debts || [];
  const metrics = dashboardData?.metrics;
  const fundsList = dashboardData?.funds || [];
  const familyInfo = dashboardData?.family;

  // v1.4.0: Check if user has private wallets
  let hasPrivateWallets = false;
  if (familyInfo) {
    const { count } = await supabase
      .from('wallets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('visibility', 'private');
    hasPrivateWallets = (count || 0) > 0;
  }

  // --- LOGIC GROUPING WALLETS ---
  const fundGroups: Record<string, { name: string, balance: number, wallets: any[] }> = {};

  // 1. Khởi tạo Group cho TẤT CẢ các Fund
  fundsList.forEach((fund: any) => {
    fundGroups[fund.name] = { name: fund.name, balance: 0, wallets: [] };
  });

  // 2. Thêm nhóm "Other Funds" đề phòng
  if (!fundGroups["Other Funds"]) {
    fundGroups["Other Funds"] = { name: "Other Funds", balance: 0, wallets: [] };
  }

  // 3. Đưa Wallet vào đúng Group
  wallets?.forEach((wallet: any) => {
    const fundName = wallet.funds?.name;
    if (fundName && fundGroups[fundName]) {
      fundGroups[fundName].wallets.push(wallet);
      fundGroups[fundName].balance += wallet.balance;
    } else {
      fundGroups["Other Funds"].wallets.push(wallet);
      fundGroups["Other Funds"].balance += wallet.balance;
    }
  });

  // 4. Sort Groups theo thứ tự ưu tiên
  const sortedGroups = Object.values(fundGroups)
    .filter(g => g.name !== "Other Funds" || g.wallets.length > 0)
    .sort((a, b) => {
      const order = ["Tiền mặt", "Quỹ dự phòng khẩn cấp", "Quỹ kế hoạch", "Quỹ đầu tư", "Daily Expenses", "Emergency Fund", "Sinking Fund", "Investment Fund"];
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <DashboardClient
      user={user}
      profile={profile}
      monthlyStats={monthlyStats}
      metrics={metrics}
      wallets={wallets}
      debts={debts}
      fundsList={fundsList}
      familyInfo={familyInfo}
      sortedGroups={sortedGroups}
      hasPrivateWallets={hasPrivateWallets}
    />
  );
}