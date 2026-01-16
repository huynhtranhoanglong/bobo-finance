"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateDebtAction, deleteDebtAction } from "@/app/actions"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/utils/format"
import { COLOR_BRAND } from "@/utils/colors"

export default function EditDebtDialog({ open, setOpen, debt, wallets, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [justRecord, setJustRecord] = useState(true);

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        formData.append("id", debt.id);
        const res = await updateDebtAction(formData);
        if (res?.error) {
            alert(res.error);
            setLoading(false);
        } else {
            setOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
        }
    }

    async function handleDelete() {
        if (!confirm(`CẢNH BÁO: Xóa khoản nợ "${debt.name}" sẽ xóa luôn TẤT CẢ lịch sử trả nợ liên quan và hoàn tiền lại về ví. Bạn có chắc không?`)) return;

        setLoading(true);
        const res = await deleteDebtAction(debt.id);
        if (res?.error) {
            alert(res.error);
            setLoading(false);
        } else {
            setOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Chỉnh sửa khoản nợ</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Tên khoản nợ</Label>
                        <Input name="name" defaultValue={debt.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Tổng số nợ gốc</Label>
                        <MoneyInput
                            name="total_amount"
                            initialValue={debt.total_amount}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>{debt.type === 'receivable' ? 'Số tiền đã được trả' : 'Số tiền đã trả'}</Label>
                        <MoneyInput
                            name="paid_amount"
                            // Mặc định tính Paid = Total - Remaining nếu chưa có dữ liệu paid riêng
                            initialValue={debt.total_amount - debt.remaining_amount}
                        />
                        <p className="text-xs text-gray-500">
                            Dư nợ còn lại hiện tại: {formatCurrency(debt.remaining_amount)}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <div
                            className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${justRecord ? 'border-transparent' : 'border-gray-300 bg-white'}`}
                            style={justRecord ? { backgroundColor: COLOR_BRAND, borderColor: COLOR_BRAND } : {}}
                            onClick={() => setJustRecord(!justRecord)}
                        >
                            {justRecord && <Plus className="h-4 w-4 text-white rotate-45" />}
                        </div>
                        <Label
                            className="cursor-pointer font-normal"
                            onClick={() => setJustRecord(!justRecord)}
                        >
                            Chỉ ghi sổ nợ (Không tính toán lại ví)
                        </Label>
                        <input type="hidden" name="just_record" value={justRecord ? "true" : "false"} />
                    </div>

                    <div className={`grid gap-2 transition-all duration-300 ${justRecord ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <Label>Chọn ví để cập nhật chênh lệch (nếu có)</Label>
                        <Select name="wallet_id" required={!justRecord}>
                            <SelectTrigger><SelectValue placeholder={justRecord ? "Đang tắt chọn ví" : "Chọn ví"} /></SelectTrigger>
                            <SelectContent>
                                {wallets.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name} ({formatCurrency(Number(w.balance))})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Nếu dư nợ thay đổi, chênh lệch sẽ được tự động cộng/trừ vào ví này.
                        </p>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full mt-4" style={{ backgroundColor: COLOR_BRAND }}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
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
                        title="Xóa khoản nợ"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Xóa khoản nợ
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}