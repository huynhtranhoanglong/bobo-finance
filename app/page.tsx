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
import EditTransactionDialog from "@/components/edit-transaction-dialog"; // Import dialog sửa
import CreateWalletDialog from "@/components/create-wallet-dialog";
import CreateDebtDialog from "@/components/create-debt-dialog";
// NEW v1.1.7
import GreetingHeader from "@/components/greeting-header";
import NetWorthSection from "@/components/net-worth-section";
import FinancialProgress from "@/components/financial-progress";
import DebtCard from "@/components/debt-card";

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
  { id: "d1", name: "Vay mua laptop", remaining_amount: 15000000, total_amount: 25000000, type: 'payable' },
  { id: "d2", name: "Nợ thẻ tín dụng", remaining_amount: 10000000, total_amount: 10000000, type: 'payable' }
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
  const { data: profile } = await supabase.rpc('get_my_profile');

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

        {/* DEBTS SECTION */}
        <h2 className="text-lg font-bold mb-4 text-gray-800">💳 Các khoản nợ</h2>
        <div className="space-y-3 mb-6">
          {DEMO_DEBTS.map((debt) => (
            <DebtCard key={debt.id} debt={debt} wallets={DEMO_WALLETS} />
          ))}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border shadow-sm cursor-not-allowed">
            <List size={20} style={{ color: '#7a869a' }} />
            <span className="text-sm font-medium" style={{ color: '#7a869a' }}>Lịch sử giao dịch</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border shadow-sm cursor-not-allowed">
            <ArrowRightLeft size={20} style={{ color: '#7a869a' }} />
            <span className="text-sm font-medium" style={{ color: '#7a869a' }}>Quản lý nợ</span>
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

  // v1.2.4: Gộp tất cả API thành 1 RPC call duy nhất
  const { data: dashboardData } = await supabase.rpc('get_dashboard_data', {
    p_month: currentMonth,
    p_year: currentYear
  });

  // Extract data từ response
  const monthlyStats = dashboardData?.monthly_stats;
  const wallets = dashboardData?.wallets || [];
  const debts = dashboardData?.debts || [];
  const metrics = dashboardData?.metrics;
  const fundsList = dashboardData?.funds || [];
  const familyInfo = dashboardData?.family;

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
      <GreetingHeader userEmail={user?.email || 'User'} userName={profile?.display_name} />

      {/* NEW v1.3.2: Family Banner */}
      {familyInfo && (
        <Link href="/family" className="block mb-4">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-green-100 transition">
            <div className="flex items-center gap-2">
              <span>👨‍👩‍👧</span>
              <span className="font-medium text-green-800">{familyInfo.name}</span>
              <span className="text-xs text-green-600">• {familyInfo.member_count} thành viên</span>
            </div>
            <span className="text-green-600 text-sm">Quản lý →</span>
          </div>
        </Link>
      )}

      {/* NEW v1.1.7: Net Worth Section */}
      <NetWorthSection netWorth={metrics?.net_worth || 0} />

      {/* NEW v1.1.7: Financial Progress */}
      <FinancialProgress metrics={metrics} />

      {/* Stats Tháng Này */}
      <MonthlyStats stats={monthlyStats} />

      {/* VÍ TIỀN (GOM NHÓM THEO QUỸ) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">💳 Ví tiền</h2>
        <CreateWalletDialog funds={fundsList || []} />
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
        {wallets?.length === 0 && <p className="text-gray-500 italic">Chưa có ví nào.</p>}
      </div>

      {/* DEBTS SECTION */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">💳 Các khoản nợ</h2>
        <CreateDebtDialog wallets={wallets || []} />
      </div>
      <div className="space-y-3 mb-6">
        {debts?.map((debt: any) => (
          <DebtCard key={debt.id} debt={debt} wallets={wallets || []} />
        ))}
        {(!debts || debts.length === 0) && (
          <div className="p-6 text-center bg-white rounded-2xl border shadow-sm">
            <p className="text-lg mb-1">🎉</p>
            <p style={{ color: '#598c58' }} className="font-medium">Tuyệt vời! Bạn không có khoản nợ nào.</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <Link
          href="/transactions"
          className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
        >
          <List size={20} style={{ color: '#598c58' }} />
          <span className="text-sm font-medium" style={{ color: '#598c58' }}>Lịch sử giao dịch</span>
        </Link>
      </div>

      {/* PHẦN 5: NÚT FAB (THÊM GIAO DỊCH / TẠO VÍ) */}
      <AddTransactionDialog wallets={wallets || []} debts={debts || []} funds={fundsList || []} />

      {/* Build Version Indicator */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Build: v1.3.7
      </p>

    </main >
  );
}