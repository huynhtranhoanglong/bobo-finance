"use client"

import { useState } from "react"
import { Trash2, Edit } from "lucide-react"
import { deleteDebtAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import EditDebtDialog from "./edit-debt-dialog"
import { PrivacyAmount } from "@/components/ui/privacy-amount";

export default function DebtItem({ debt }: { debt: any }) {
    const [isEditOpen, setIsEditOpen] = useState(false); // State bật tắt bảng Sửa

    // 2. Xử lý xóa
    const handleDelete = async () => {
        if (!confirm(`CẢNH BÁO: Xóa khoản nợ "${debt.name}" sẽ xóa luôn TẤT CẢ lịch sử trả nợ liên quan và hoàn tiền lại về ví. Bạn có chắc không?`)) return;
        await deleteDebtAction(debt.id);
    }

    // 3. Tính toán tiến độ
    const paidAmount = debt.total_amount - debt.remaining_amount;
    // Nếu tổng vay = 0 (tránh chia cho 0) thì progress = 0, ngược lại tính %
    const progress = debt.total_amount > 0 ? (paidAmount / debt.total_amount) * 100 : 0;

    const isPayable = debt.type === 'payable'; // True: Mình nợ, False: Họ nợ

    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 group transition hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                    {/* Thông tin bên trái */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{debt.name}</h3>
                        <p className="text-sm text-gray-500">{isPayable ? "Mình nợ" : "Họ nợ"}</p>
                    </div>

                    {/* Thông tin bên phải: Số tiền + Nút thao tác */}
                    <div className="flex items-center gap-3">
                        <div className={`text-xl font-bold ${isPayable ? 'text-red-600' : 'text-green-600'}`}>
                            <PrivacyAmount amount={debt.remaining_amount} />
                        </div>

                        {/* Nút Sửa: Mở Dialog */}
                        <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)} className="text-gray-300 hover:text-blue-600">
                            <Edit className="h-5 w-5" />
                        </Button>

                        {/* Nút Xóa: Gọi hàm delete */}
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-gray-300 hover:text-red-600">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Thanh tiến trình trả nợ */}
                <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Đã trả: <PrivacyAmount amount={paidAmount} /></span>
                        <span>Tổng vay: <PrivacyAmount amount={debt.total_amount} /></span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-right text-xs font-medium text-blue-600">
                        {progress.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Dialog Sửa (Chỉ hiện khi isEditOpen = true) */}
            {isEditOpen && (
                <EditDebtDialog
                    open={isEditOpen}
                    setOpen={setIsEditOpen}
                    debt={debt}
                />
            )}
        </>
    )
}