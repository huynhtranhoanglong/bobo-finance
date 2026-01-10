"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateDebtAction } from "@/app/actions"

export default function EditDebtDialog({ open, setOpen, debt }: any) {
    const [loading, setLoading] = useState(false);

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        formData.append("id", debt.id);
        const res = await updateDebtAction(formData);
        setLoading(false);
        if (res?.error) alert(res.error);
        else setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sửa Khoản Nợ</DialogTitle>
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
                    <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu Thay Đổi"}</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}