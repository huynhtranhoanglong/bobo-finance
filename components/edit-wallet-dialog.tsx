"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateWalletAction, deleteWalletAction } from "@/app/actions"
import { Trash2, Loader2 } from "lucide-react"

export default function EditWalletDialog({
    wallet,
    funds,
    open,
    setOpen
}: {
    wallet: any,
    funds: any[],
    open: boolean,
    setOpen: (open: boolean) => void
}) {
    const [loading, setLoading] = useState(false)

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        // Append ID vì form không tự gửi nếu disable input (hoặc hidden input)
        formData.append("id", wallet.id);

        const result = await updateWalletAction(formData);
        setLoading(false);

        if (result?.error) {
            alert("Lỗi: " + result.error);
        } else {
            setOpen(false);
        }
    }

    async function handleDelete() {
        if (!confirm("CẢNH BÁO: Xóa ví này sẽ XÓA SẠCH toàn bộ giao dịch liên quan!\n\nHành động này không thể hoàn tác.\nBạn có chắc chắn muốn xóa?")) {
            return;
        }

        setLoading(true);
        const result = await deleteWalletAction(wallet.id);
        setLoading(false);

        if (result?.error) {
            alert("Lỗi: " + result.error);
        } else {
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Chỉnh Sửa Ví</DialogTitle>
                </DialogHeader>

                <form action={handleUpdate} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>Tên Ví</Label>
                        <Input name="name" defaultValue={wallet.name} required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Thuộc Quỹ</Label>
                        <Select name="fund_id" defaultValue={wallet.funds?.id || wallet.fund_id} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {funds.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Số dư hiện tại</Label>
                        <MoneyInput
                            name="balance"
                            initialValue={Number(wallet.balance)}
                            required
                            className="font-bold text-lg"
                        />
                        <p className="text-xs text-blue-600">
                            *Hệ thống sẽ tự động tạo giao dịch điều chỉnh (Thu/Chi) nếu số dư thay đổi.
                        </p>
                    </div>

                    <Button type="submit" disabled={loading} className="mt-4 w-full" style={{ backgroundColor: '#598c58' }}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "Lưu Thay Đổi"}
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
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                        {loading ? "Đang xoá..." : "Xóa Ví Này"}
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    )
}
