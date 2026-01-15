"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateDebtAction, deleteDebtAction } from "@/app/actions"
import { Trash2 } from "lucide-react"

export default function EditDebtDialog({ open, setOpen, debt, onSuccess }: any) {
    const [loading, setLoading] = useState(false);

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa khoản nợ</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Tên khoản nợ</Label>
                        <Input name="name" defaultValue={debt.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Tổng số tiền vay</Label>
                        <Input name="total_amount" type="number" defaultValue={debt.total_amount} required className="font-bold" />
                        <p className="text-xs text-gray-500">
                            Thay đổi tổng vay sẽ tự động cập nhật dư nợ còn lại tương ứng.
                        </p>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full mt-4">
                        <div className="flex-1">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleDelete}
                                disabled={loading}
                                title="Xóa khoản nợ"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading} style={{ backgroundColor: '#598c58' }}>
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}