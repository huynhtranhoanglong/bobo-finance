import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DebtItem from "@/components/debt-item"; // Import component con đã tách
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { UserNav } from "@/components/user-nav";
export default async function DebtsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Lấy danh sách tất cả khoản nợ (cả nợ đi vay và nợ cho vay)
    const { data: debts, error } = await supabase
        .from("debts")
        .select("*")
        .order("remaining_amount", { ascending: false }); // Sắp xếp khoản nợ lớn lên đầu

    if (error) {
        return <div className="p-8 text-red-500">Lỗi tải dữ liệu: {error.message}</div>;
    }

    // Hàm định dạng tiền tệ (truyền xuống cho con dùng)
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <main className="p-4 md:p-8 max-w-3xl mx-auto pb-24 bg-gray-50 min-h-screen">

            {/* Header: Nút Quay lại + Tiêu đề */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-bold">Quản lý Nợ</h1>
                </div>
                <div className="flex items-center gap-2">
                    <PrivacyToggle />
                    {user && <UserNav email={user.email || 'User'} />}
                </div>
            </div>

            {/* Danh sách các khoản nợ */}
            <div className="grid gap-4">
                {debts?.map((debt: any) => (
                    // Gọi component con hiển thị từng dòng
                    <DebtItem
                        key={debt.id}
                        debt={debt}
                    />
                ))}

                {/* Trạng thái trống */}
                {debts?.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                        <p className="text-gray-500">Bạn hiện không có khoản nợ nào.</p>
                    </div>
                )}
            </div>
        </main>
    );
}