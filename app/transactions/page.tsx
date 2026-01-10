import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TransactionItem from "@/components/transaction-item";

export default async function TransactionsPage() {
    const supabase = await createClient();

    // 1. Lấy danh sách Ví (QUAN TRỌNG: Để truyền xuống cho Dialog Sửa dùng chọn lại ví)
    const { data: wallets } = await supabase
        .from("wallets")
        .select("id, name");

    // 2. Lấy lịch sử giao dịch (Kèm tên ví và tên khoản nợ)
    const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
      *,
      wallets:wallet_id ( name ),
      debts:related_debt_id ( name )
    `)
        .order('date', { ascending: false }); // Mới nhất lên đầu

    if (error) {
        return <div className="p-8 text-red-500">Lỗi tải dữ liệu: {error.message}</div>;
    }

    return (
        <main className="p-4 md:p-8 max-w-3xl mx-auto pb-24 bg-gray-50 min-h-screen">
            {/* Header: Nút Quay lại + Tiêu đề */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                    <ArrowLeft className="h-6 w-6 text-gray-700" />
                </Link>
                <h1 className="text-2xl font-bold">Lịch sử giao dịch</h1>
            </div>

            {/* Danh sách giao dịch */}
            <div className="space-y-3">
                {transactions?.map((t: any) => (
                    <TransactionItem
                        key={t.id}
                        transaction={t}
                        wallets={wallets || []} // <--- Truyền wallets xuống để dùng trong Dialog Sửa
                    />
                ))}

                {transactions?.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        Chưa có giao dịch nào. Hãy tạo giao dịch đầu tiên!
                    </div>
                )}
            </div>
        </main>
    );
}