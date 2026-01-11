import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRightLeft, List } from "lucide-react";

// Import các Components con
import AddTransactionDialog from "@/components/add-transaction-dialog";
import FinancialOverview from "@/components/financial-overview";
import MonthlyStats from "@/components/monthly-stats";
import FundGroup from "@/components/fund-group"; // NEW v1.0.7

export default async function Home() {
  const supabase = await createClient();

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

  // Group by Fund Name
  wallets?.forEach((wallet: any) => {
    const fundName = wallet.funds?.name || "Other Funds";

    if (!fundGroups[fundName]) {
      fundGroups[fundName] = { name: fundName, balance: 0, wallets: [] };
    }

    fundGroups[fundName].wallets.push(wallet);
    fundGroups[fundName].balance += wallet.balance;
  });

  // Convert to Array & Sort
  const sortedGroups = Object.values(fundGroups).sort((a, b) => {
    const order = ["Daily Expense", "Emergency Fund", "Sinking Fund", "Investment Fund"];
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

      <h1 className="text-3xl font-bold mb-6 text-gray-900">💰 Tài sản của tôi (Bobo)</h1>

      {/* Stats Tháng Này */}
      <MonthlyStats stats={monthlyStats} />

      {/* Overview */}
      <FinancialOverview metrics={metrics} />

      {/* Navigation */}
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

      {/* VÍ TIỀN (GOM NHÓM THEO QUỸ) v1.0.7 */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Ví tiền</h2>
      <div className="mb-8">
        {sortedGroups.map((group) => (
          <FundGroup
            key={group.name}
            fundName={group.name}
            totalBalance={group.balance}
            wallets={group.wallets}
            fundsList={fundsList}
          />
        ))}
        {wallets?.length === 0 && <p className="text-gray-500 italic">Chưa có ví nào.</p>}
      </div>

      {/* PHẦN 4: DANH SÁCH NỢ (PREVIEW) */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">📉 Các khoản nợ</h2>
      <div className="grid gap-4">
        {debts?.map((debt: any) => (
          <div key={debt.id} className="p-4 border border-red-200 bg-red-50 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{debt.name}</span>
              <span className="font-bold text-red-600">
                Còn nợ: {formatMoney(debt.remaining_amount)}
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

      {/* PHẦN 5: NÚT FAB (THÊM GIAO DỊCH / TẠO VÍ) */}
      <AddTransactionDialog wallets={wallets || []} debts={debts || []} funds={funds || []} />

    </main>
  );
}