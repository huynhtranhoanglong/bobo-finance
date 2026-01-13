"use client"

import { useState } from "react"
import { MoreHorizontal, Trash2, Edit, ArrowRight, ArrowRightLeft, CreditCard, Wallet } from "lucide-react"
import { deleteTransactionAction } from "@/app/actions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import EditTransactionDialog from "./edit-transaction-dialog"
import { PrivacyAmount } from "@/components/ui/privacy-amount";

// Nhận thêm props 'wallets' từ trang cha truyền xuống
export default function TransactionItem({ transaction, wallets }: { transaction: any, wallets: any[] }) {
    const [loading, setLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false); // State để bật tắt bảng Sửa

    // 2. Hàm định dạng ngày tháng (Client Side)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // 3. Xử lý xóa
    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này? Tiền sẽ được hoàn lại ví.")) return;

        setLoading(true);
        await deleteTransactionAction(transaction.id);
        setLoading(false);
    }

    // 4. Logic hiển thị Icon/Màu sắc
    let icon = <Wallet className="h-5 w-5" />;
    let colorClass = "text-gray-700";
    let bgClass = "bg-gray-100";
    let sign = "";

    if (transaction.type === 'income') {
        icon = <ArrowRight className="h-5 w-5 rotate-45" />;
        colorClass = "text-green-600";
        bgClass = "bg-green-100";
        sign = "+";
    } else if (transaction.type === 'expense') {
        icon = <ArrowRight className="h-5 w-5 -rotate-45" />;
        colorClass = "text-red-600";
        bgClass = "bg-red-100";
        sign = "-";
    } else if (transaction.type === 'transfer_out' || transaction.type === 'transfer_in') {
        icon = <ArrowRightLeft className="h-5 w-5" />;
        colorClass = "text-blue-600";
        bgClass = "bg-blue-100";
    } else if (transaction.type === 'debt_repayment') {
        icon = <CreditCard className="h-5 w-5" />;
        colorClass = "text-orange-600";
        bgClass = "bg-orange-100";
        sign = "-";
    }

    return (
        <>
            <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center ${loading ? 'opacity-50' : ''}`}>

                {/* Thông tin bên trái */}
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Menu thao tác (3 chấm) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

                            {/* Nút Sửa: Mở Dialog */}
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Sửa giao dịch
                            </DropdownMenuItem>

                            {/* Nút Xóa: Gọi hàm delete */}
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa giao dịch
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${bgClass} ${colorClass} hidden sm:flex`}>
                            {icon}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-xs">
                                {transaction.note || (transaction.type === 'debt_repayment' ? 'Trả nợ' : 'Giao dịch')}
                            </p>
                            <div className="text-xs text-gray-500">
                                {formatDate(transaction.date)} • {transaction.wallets?.name || "Ví đã xóa"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Số tiền bên phải */}
                <div className={`font-bold ${colorClass}`}>
                    {sign}<PrivacyAmount amount={transaction.amount} />
                </div>
            </div>

            {/* Dialog Sửa (Chỉ hiện khi isEditOpen = true) */}
            {isEditOpen && (
                <EditTransactionDialog
                    open={isEditOpen}
                    setOpen={setIsEditOpen}
                    transaction={transaction}
                    wallets={wallets}
                />
            )}
        </>
    )
}