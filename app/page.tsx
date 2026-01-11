import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowRightLeft, List } from "lucide-react";

// Import các Components con
import AddTransactionDialog from "@/components/add-transaction-dialog";
import FinancialOverview from "@/components/financial-overview";

export default async function Home() {
  const supabase = await createClient();

  // 1. Lấy dữ liệu Ví (Wallets)
  // Kèm theo tên Quỹ (funds) để hiển thị
  const { data: wallets } = await supabase
    .from("wallets")
    .select(`
      id,
      name,
      balance,
      funds ( name )
    `)
    .order('balance', { ascending: false }); // Ví nhiều tiền nhất lên đầu

  // 2. Lấy dữ liệu Nợ (Debts)
  // Chỉ lấy các khoản mình nợ (payable) và còn dư nợ > 0
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
    .order('remaining_amount', { ascending: false }); // Nợ nhiều nhất lên đầu

  // 3. Lấy các chỉ số tài chính (Metrics) từ hàm SQL đã viết
  // (Chi tiêu tối thiểu, Mục tiêu tự do tài chính...)
  const { data: metrics } = await supabase.rpc('get_financial_metrics');

  // Hàm format tiền tệ cho đẹp (VND)
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // 4. Lấy danh sách Quỹ (Funds) để tạo ví mới
  const { data: funds } = await supabase.from("funds").select("id, name");

  return (
    <main className="p-4 md:p-8 max-w-2xl mx-auto pb-32 bg-gray-50 min-h-screen">

      {/* TIÊU ĐỀ */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900">💰 Tài sản của tôi (Bobo)</h1>

      {/* PHẦN 1: DASHBOARD TỔNG QUAN (AN TOÀN / TỰ DO TÀI CHÍNH) */}
      <FinancialOverview metrics={metrics} />

      {/* PHẦN 2: CÁC NÚT ĐIỀU HƯỚNG NHANH */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Nút sang trang Lịch sử */}
        <Link
          href="/transactions"
          className="flex items-center justify-center gap-2 p-4 bg-white border rounded-xl shadow-sm hover:bg-blue-50 transition font-semibold text-blue-600"
        >
          <List className="h-5 w-5" />
          Xem Lịch sử
        </Link>

        {/* Nút sang trang Quản lý Nợ */}
        <Link
          href="/debts"
          className="flex items-center justify-center gap-2 p-4 bg-white border rounded-xl shadow-sm hover:bg-orange-50 transition font-semibold text-orange-600"
        >
          <ArrowRightLeft className="h-5 w-5" />
          Quản lý Nợ
        </Link>
      </div>

      {/* PHẦN 3: DANH SÁCH VÍ TIỀN */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Ví tiền</h2>
      <div className="grid gap-4 mb-8">
        {wallets?.map((wallet: any) => (
          <div key={wallet.id} className="p-4 border rounded-lg shadow-sm bg-white text-black transition hover:shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{wallet.name}</h3>
                <p className="text-sm text-gray-500">
                  {wallet.funds?.name || "Chưa phân loại"}
                </p>
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatMoney(wallet.balance)}
              </div>
            </div>
          </div>
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