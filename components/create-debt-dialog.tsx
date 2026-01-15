"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTransaction } from "@/app/actions"
import { useRouter } from "next/navigation"

export default function CreateDebtDialog({ wallets }: { wallets: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [debtType, setDebtType] = useState("payable")
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // Force type to create_debt for the action
        formData.append("type", "create_debt");
        formData.append("debt_type", debtType);

        const result = await addTransaction(formData);
        setLoading(false);

        if (result?.error) {
            alert("Lỗi: " + result.error);
        } else {
            setOpen(false);
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Tạo Khoản Nợ Mới</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    {/* Chọn loại nợ */}
                    <div className="flex gap-4 justify-center bg-gray-50 p-2 rounded-lg">
                        <div
                            className={`cursor-pointer px-4 py-2 rounded-md border transition-all ${debtType === 'payable' ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm' : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'}`}
                            onClick={() => setDebtType('payable')}
                        >
                            Đi Vay (Nợ)
                        </div>
                        <div
                            className={`cursor-pointer px-4 py-2 rounded-md border transition-all ${debtType === 'receivable' ? 'bg-green-50 border-green-500 text-green-700 font-bold shadow-sm' : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'}`}
                            onClick={() => setDebtType('receivable')}
                        >
                            Cho Vay
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Tên khoản nợ</Label>
                        <Input name="debt_name" placeholder="Vd: Vay ngân hàng, Cho Tuấn mượn..." required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Số tiền nợ</Label>
                        <MoneyInput name="amount" placeholder="0" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>{debtType === 'payable' ? 'Tiền về ví nào?' : 'Lấy tiền từ ví nào?'}</Label>
                        <Select name="wallet_id" required>
                            <SelectTrigger><SelectValue placeholder="Chọn ví" /></SelectTrigger>
                            <SelectContent>
                                {wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(w.balance))})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Hệ thống sẽ tự động tạo giao dịch {debtType === 'payable' ? 'Thu nhập' : 'Chi tiêu'} tương ứng.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Mức lãi suất</Label>
                        <Select name="interest_level" defaultValue="none">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Không lãi (Người thân)</SelectItem>
                                <SelectItem value="low">Lãi thấp</SelectItem>
                                <SelectItem value="medium">Lãi trung bình</SelectItem>
                                <SelectItem value="high">Lãi cao (Thẻ tín dụng/Nóng)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Ghi chú</Label>
                        <Input name="note" placeholder="..." />
                    </div>

                    <Button type="submit" disabled={loading} style={{ backgroundColor: '#598c58' }} className="w-full mt-2">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Tạo Khoản Nợ"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
