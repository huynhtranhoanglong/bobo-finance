"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTransactionAction } from "@/app/actions"

export default function EditTransactionDialog({ open, setOpen, transaction, wallets }: any) {
    const [loading, setLoading] = useState(false);

    // Form action
    async function handleUpdate(formData: FormData) {
        setLoading(true);
        formData.append("id", transaction.id);
        const res = await updateTransactionAction(formData);
        setLoading(false);
        if (res?.error) alert(res.error);
        else setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sửa Giao Dịch</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>Số tiền</Label>
                        <Input name="amount" type="number" defaultValue={transaction.amount} required className="font-bold" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Ví</Label>
                        {/* Nếu ví đã bị xóa thì hiển thị ID, nếu còn thì hiển thị tên */}
                        <Select name="wallet_id" defaultValue={transaction.wallet_id} required>
                            <SelectTrigger><SelectValue placeholder="Chọn ví" /></SelectTrigger>
                            <SelectContent>
                                {wallets?.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Ghi chú</Label>
                        <Input name="note" defaultValue={transaction.note || ""} />
                    </div>

                    <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu Thay Đổi"}</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}