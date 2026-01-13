import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TransactionItem from "@/components/transaction-item";
import TransactionFilters from "@/components/transaction-filters";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { UserNav } from "@/components/user-nav";
export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const { data: { user } } = await supabase.auth.getUser();

    // Lấy các tham số filter từ URL
    const q = (params.q as string) || "";
    const wallet_id = (params.wallet as string) || "";
    const type = (params.type as string) || "";
    const sort = (params.sort as string) || "date_desc";

    // 1. Lấy danh sách Ví (để truyền vào Filters Component)
    const { data: wallets } = await supabase
        .from("wallets")
        .select("id, name");

    // 2. Build Query Giao dịch
    let query = supabase
        .from("transactions")
        .select(`
      *,
      wallets:wallet_id ( name ),
      debts:related_debt_id ( name )
    `);

    // -> Áp dụng bộ lọc
    if (q) {
        query = query.ilike("note", `%${q}%`); // Tìm theo Note
    }
    if (wallet_id && wallet_id !== "all") {
        query = query.eq("wallet_id", wallet_id);
    }
    if (type && type !== "all") {
        query = query.eq("type", type);
    }

    // -> Áp dụng Sắp xếp
    if (sort === "date_asc") {
        query = query.order("date", { ascending: true });
    } else if (sort === "amount_desc") {
        query = query.order("amount", { ascending: false });
    } else if (sort === "amount_asc") {
        query = query.order("amount", { ascending: true });
    } else {
        // Mặc định: Mới nhất trước (date_desc)
        query = query.order("date", { ascending: false });
    }

    const { data: transactions, error } = await query;

    if (error) {
        return <div className="p-8 text-red-500">Lỗi tải dữ liệu: {error.message}</div>;
    }

    return (
        <main className="p-4 md:p-8 max-w-3xl mx-auto pb-24 bg-gray-50 min-h-screen">
            {/* Header: Nút Quay lại + Tiêu đề */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-bold">Lịch sử giao dịch</h1>
                </div>
                <div className="flex items-center gap-2">
                    <PrivacyToggle />
                    {user && <UserNav email={user.email || 'User'} />}
                </div>
            </div>

            {/* BỘ LỌC */}
            <TransactionFilters wallets={wallets || []} />

            {/* Danh sách giao dịch */}
            <div className="space-y-3">
                {transactions?.map((t: any) => (
                    <TransactionItem
                        key={t.id}
                        transaction={t}
                        wallets={wallets || []}
                    />
                ))}

                {transactions?.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        Không tìm thấy giao dịch nào.
                    </div>
                )}
            </div>
        </main>
    );
}