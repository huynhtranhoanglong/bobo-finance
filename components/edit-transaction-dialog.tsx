"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTransactionAction, deleteTransactionAction } from "@/app/actions"
import { Trash2 } from "lucide-react"

export default function EditTransactionDialog({ open, setOpen, transaction, wallets, onSuccess }: any) {
    const [loading, setLoading] = useState(false);

    // Form action
    async function handleUpdate(formData: FormData) {
        setLoading(true);
        formData.append("id", transaction.id);
        const res = await updateTransactionAction(formData);
        setLoading(false);
        if (res?.error) alert(res.error);
        else {
            setOpen(false);
            onSuccess?.(); // Trigger refresh if callback provided
        }
    }

    // Delete action
    async function handleDelete() {
        if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này? Tiền sẽ được hoàn lại ví.")) return;

        setLoading(true);
        const res = await deleteTransactionAction(transaction.id);
        setLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            setOpen(false);
            onSuccess?.(); // Trigger refresh if callback provided
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Sửa Giao Dịch</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">

                    {/* 1. SỐ TIỀN */}
                    <div className="grid gap-2">
                        <Label>Số tiền</Label>
                        <Input name="amount" type="number" defaultValue={transaction.amount} required className="font-bold text-lg" />
                    </div>

                    {/* 2. LOẠI (Read-only) + DANH MỤC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Loại</Label>
                            <Input disabled value={transaction.type === 'expense' ? 'Chi tiêu' : transaction.type === 'income' ? 'Thu nhập' : transaction.type} />
                        </div>

                        {/* Chỉ hiện Category nếu là Thu/Chi */}
                        {(transaction.type === 'expense' || transaction.type === 'income') && (
                            <div className="grid gap-2">
                                <Label>Danh mục</Label>
                                <Select name="category" defaultValue={transaction.category_level || ""} required>
                                    <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                                    <SelectContent>
                                        {transaction.type === 'expense' ? (
                                            <>
                                                <SelectItem value="must_have">🔴 Must Have</SelectItem>
                                                <SelectItem value="nice_to_have">🟡 Nice to Have</SelectItem>
                                                <SelectItem value="waste">⚫ Waste</SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <SelectItem value="salary">💵 Lương</SelectItem>
                                                <SelectItem value="other_income">💎 Khác</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* 3. NGÀY THÁNG */}
                    <div className="grid gap-2">
                        <Label>Thời gian</Label>
                        {/* Format date sang dạng YYYY-MM-DDTHH:mm để hiển thị đúng trong input datetime-local */}
                        <Input
                            name="date"
                            type="datetime-local"
                            defaultValue={transaction.date ? new Date(transaction.date).toISOString().slice(0, 16) : ""}
                            required
                        />
                    </div>

                    {/* 4. VÍ */}
                    <div className="grid gap-2">
                        <Label>Ví</Label>
                        <Select name="wallet_id" defaultValue={transaction.wallet_id} required>
                            <SelectTrigger><SelectValue placeholder="Chọn ví" /></SelectTrigger>
                            <SelectContent>
                                {wallets?.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 5. GHI CHÚ */}
                    <div className="grid gap-2">
                        <Label>Ghi chú</Label>
                        <Input name="note" defaultValue={transaction.note || ""} />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4"
                        style={{ backgroundColor: '#598c58' }}
                    >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Hoặc</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full flex gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Xóa giao dịch
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}