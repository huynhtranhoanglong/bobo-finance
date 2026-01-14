import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRightLeft, List } from "lucide-react";

// Import các Components con
import AddTransactionDialog from "@/components/add-transaction-dialog";
import MonthlyStats from "@/components/monthly-stats";
import FundGroup from "@/components/fund-group";
import { UserNav } from "@/components/user-nav";
import { ensureDefaultFunds } from "@/app/actions/ensure-funds";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { DisablePrivacyOnMount } from "@/components/ui/disable-privacy";
// NEW v1.1.7
import GreetingHeader from "@/components/greeting-header";
import NetWorthSection from "@/components/net-worth-section";
import FinancialProgress from "@/components/financial-progress";

// ===================== DEMO MODE DATA =====================
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
  { id: "d1", name: "Vay mua laptop", remaining_amount: 15000000, total_amount: 25000000 },
  { id: "d2", name: "Nợ thẻ tín dụng", remaining_amount: 10000000, total_amount: 10000000 }
];
// ===========================================================

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const isDemo = params.demo === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Nếu DEMO MODE -> Dùng dữ liệu mẫu, không query DB
  if (isDemo) {
    // Xử lý grouping cho demo wallets
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
            🎮 Chế độ Demo - Dữ liệu mẫu | <Link href="/login" className="underline font-bold">Đăng nhập để sử dụng thật</Link>
          </p>
        </div>

        {/* NEW v1.1.7: Greeting Header */}
        <GreetingHeader showControls={false} />

        {/* NEW v1.1.7: Net Worth Section */}
        <NetWorthSection netWorth={DEMO_METRICS.net_worth} />

        {/* NEW v1.1.7: Financial Progress */}
        <FinancialProgress metrics={DEMO_METRICS} />

        {/* Stats Tháng Này */}
        <MonthlyStats stats={DEMO_MONTHLY_STATS} />

        <h2 className="text-lg font-bold mb-4 text-gray-800">💳 Ví tiền</h2>
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

        <h2 className="text-xl font-bold mb-4 text-gray-800">📉 Các khoản nợ</h2>
        <div className="grid gap-4 mb-8">
          {DEMO_DEBTS.map((debt) => (
            <div key={debt.id} className="p-4 border border-red-200 bg-red-50 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{debt.name}</span>
                <span className="font-bold text-red-600">
                  Còn nợ: <PrivacyAmount amount={debt.remaining_amount} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center justify-center gap-2 p-4 bg-white border rounded-xl shadow-sm text-gray-400 cursor-not-allowed">
            <List className="h-5 w-5" />
            Xem Lịch sử (Demo)
          </div>
          <div className="flex items-center justify-center gap-2 p-4 bg-white border rounded-xl shadow-sm text-gray-400 cursor-not-allowed">
            <ArrowRightLeft className="h-5 w-5" />
            Quản lý Nợ (Demo)
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Build: v1.1.7 (Demo Mode)</p>
      </main>
    );
  }

  // ===================== REAL USER MODE =====================
  // NEW v1.1.1: Đảm bảo user có đủ 4 funds mặc định
  await ensureDefaultFunds();

  // 0. Chuẩn bị thời gian (Tháng hiện tại)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // 1. Lấy thống kê Tháng này
  const { data: monthlyStats } = await supabase.rpc('get_monthly_stats', {
    p_month: currentMonth,
    p_year: currentYear
  });

  // 2. Lấy dữ liệu Ví (Wallets)
  const { data: wallets } = await supabase
    .from("wallets")
    .select(`
      id,
      name,
      balance,
      fund_id, 
      funds ( id, name )
    `)
    .order('balance', { ascending: false });

  // 3. Lấy dữ liệu Nợ (Debts)
  const { data: debts } = await supabase
    .from("debts")
    .select(`
      id,
      name,
      remaining_amount,
      total_amount
    `)
    .eq('type', 'payable')
    .gt('remaining_amount', 0)
    .order('remaining_amount', { ascending: false });

  // 4. Lấy metrics
  const { data: metrics } = await supabase.rpc('get_financial_metrics');

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // 5. Lấy danh sách Funds
  const { data: funds } = await supabase.from("funds").select("id, name");
  const fundsList = funds || [];

  // --- LOGIC GROUPING WALLETS (v1.0.7) ---
  const fundGroups: Record<string, { name: string, balance: number, wallets: any[] }> = {};

  // 1. Khởi tạo Group cho TẤT CẢ các Fund (kể cả Fund rỗng)
  fundsList.forEach((fund: any) => {
    fundGroups[fund.name] = { name: fund.name, balance: 0, wallets: [] };
  });

  // 2. Thêm nhóm "Other Funds" đề phòng có ví mồ côi
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
      // Bỏ vào Other Funds nếu không tìm thấy Fund cha
      fundGroups["Other Funds"].wallets.push(wallet);
      fundGroups["Other Funds"].balance += wallet.balance;
    }
  });

  // 4. Sort Groups theo thứ tự ưu tiên
  // Note: Dựa vào hình ảnh user cung cấp: "Daily Expenses", "Invesment Fund" (typo)
  const sortedGroups = Object.values(fundGroups)
    .filter(g => g.name !== "Other Funds" || g.wallets.length > 0) // Chỉ hiện Other Funds nếu có ví
    .sort((a, b) => {
      const order = ["Tiền mặt", "Quỹ dự phòng khẩn cấp", "Quỹ kế hoạch", "Quỹ đầu tư", "Daily Expenses", "Emergency Fund", "Sinking Fund", "Investment Fund", "Invesment Fund"];
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);

      // Nếu cả 2 đều nằm trong list ưu tiên -> sort theo index
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;

      // Nếu chỉ A có -> A lên trước
      if (indexA !== -1) return -1;

      // Nếu chỉ B có -> B lên trước
      if (indexB !== -1) return 1;

      // Còn lại sort ABC
      return a.name.localeCompare(b.name);
    });
  // ---------------------------------------

  return (
    <main className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">

      {/* NEW v1.1.7: Greeting Header */}
      <GreetingHeader userEmail={user?.email || 'User'} />

      {/* NEW v1.1.7: Net Worth Section */}
      <NetWorthSection netWorth={metrics?.net_worth || 0} />

      {/* NEW v1.1.7: Financial Progress */}
      <FinancialProgress metrics={metrics} />

      {/* Stats Tháng Này */}
      <MonthlyStats stats={monthlyStats} />

      {/* VÍ TIỀN (GOM NHÓM THEO QUỸ) */}
      <h2 className="text-lg font-bold mb-4 text-gray-800">💳 Ví tiền</h2>
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
        {wallets?.length === 0 && <p className="text-gray-500 italic">Chưa có ví nào.</p>}
      </div>

      {/* PHẦN 4: DANH SÁCH NỢ (PREVIEW) */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">📉 Các khoản nợ</h2>
      <div className="grid gap-4 mb-8">
        {debts?.map((debt: any) => (
          <div key={debt.id} className="p-4 border border-red-200 bg-red-50 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{debt.name}</span>
              <span className="font-bold text-red-600">
                Còn nợ: <PrivacyAmount amount={debt.remaining_amount} />
              </span>
            </div>
          </div>
        ))}
        {(!debts || debts.length === 0) && (
          <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">Tuyệt vời! Bạn không có khoản nợ nào.</p>
          </div>
        )}
      </div>

      {/* Navigation - ĐƯA XUỐNG DƯỚI */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/transactions"
          className="flex items-center justify-center gap-2 p-4 bg-white border rounded-xl shadow-sm hover:bg-blue-50 transition font-semibold text-blue-600"
        >
          <List className="h-5 w-5" />
          Xem Lịch sử
        </Link>
        <Link
          href="/debts"
          className="flex items-center justify-center gap-2 p-4 bg-white border rounded-xl shadow-sm hover:bg-orange-50 transition font-semibold text-orange-600"
        >
          <ArrowRightLeft className="h-5 w-5" />
          Quản lý Nợ
        </Link>
      </div>

      {/* PHẦN 5: NÚT FAB (THÊM GIAO DỊCH / TẠO VÍ) */}
      <AddTransactionDialog wallets={wallets || []} debts={debts || []} funds={funds || []} />

      {/* Build Version Indicator */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Build: v1.1.7
      </p>

    </main>
  );
}