"use client"

import { useState } from "react"
import { Plus, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addTransaction } from "@/app/actions"

export default function AddTransactionDialog({ wallets, debts, funds, onSuccess }: { wallets: any[], debts: any[], funds: any[], onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState("expense")
    const [debtType, setDebtType] = useState("payable")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        // CASE: CÁC LOẠI GIAO DỊCH
        formData.append("type", type);

        const result = await addTransaction(formData);
        setLoading(false);

        if (result?.error) {
            alert("Lỗi: " + result.error);
        } else {
            setOpen(false);
            onSuccess?.(); // Trigger refresh
        }
    }

    // Tiêu đề động
    const getTitle = () => {
        switch (type) {
            case 'transfer': return 'Chuyển Khoản';
            case 'debt_repayment': return 'Trả Nợ Cũ';
            default: return 'Thêm Giao Dịch';
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg text-white z-50 hover:scale-105 transition-transform"
                    style={{ backgroundColor: '#598c58' }}
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">{getTitle()}</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">

                    {/* 1. THANH CHỌN LOẠI (4 Nút - Grid 4 cột) */}
                    <div className="grid grid-cols-4 gap-2">
                        <Button type="button" size="sm" variant={type === "expense" ? "default" : "outline"} onClick={() => setType("expense")} className={type === "expense" ? "bg-red-500" : ""}>💸 Chi</Button>
                        <Button type="button" size="sm" variant={type === "income" ? "default" : "outline"} onClick={() => setType("income")} className={type === "income" ? "bg-green-500" : ""}>💰 Thu</Button>
                        <Button type="button" size="sm" variant={type === "transfer" ? "default" : "outline"} onClick={() => setType("transfer")} className={type === "transfer" ? "bg-blue-500" : ""}>🔄 Chuyển</Button>
                        <Button type="button" size="sm" variant={type === "debt_repayment" ? "default" : "outline"} onClick={() => setType("debt_repayment")} className={type === "debt_repayment" ? "bg-orange-500" : ""}>📉 Trả Nợ</Button>
                    </div>

                    {/* ==================== FORM CHUNG ==================== */}

                    {/* SỐ TIỀN (Luôn hiện) */}
                    <div className="grid gap-2">
                        <Label>Số tiền</Label>
                        <Input name="amount" type="number" placeholder="0" required className="text-lg font-bold" />
                    </div>

                    {/* CASE: TRẢ NỢ CŨ */}
                    {type === 'debt_repayment' && (
                        <>
                            <div className="grid gap-2">
                                <Label>Lấy tiền từ Ví</Label>
                                <Select name="wallet_id" required>
                                    <SelectTrigger><SelectValue placeholder="Chọn ví" /></SelectTrigger>
                                    <SelectContent>
                                        {wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(w.balance)})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Khoản nợ cần trả</Label>
                                <Select name="debt_id" required>
                                    <SelectTrigger><SelectValue placeholder="Chọn khoản nợ" /></SelectTrigger>
                                    <SelectContent>
                                        {debts.map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name} (Còn: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.remaining_amount)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {debts.length === 0 && <p className="text-xs text-red-500">Không có khoản nợ nào!</p>}
                            </div>
                        </>
                    )}

                    {/* CASE: CHUYỂN KHOẢN */}
                    {type === 'transfer' && (
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                            <div className="grid gap-2">
                                <Label>Từ ví</Label>
                                <Select name="wallet_id" required><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger><SelectContent>{wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <ArrowRightLeft className="mb-3 text-gray-400" size={20} />
                            <div className="grid gap-2">
                                <Label>Đến ví</Label>
                                <Select name="to_wallet_id" required><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger><SelectContent>{wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select>
                            </div>
                        </div>
                    )}

                    {/* CASE: THU / CHI THƯỜNG */}
                    {(type === 'expense' || type === 'income') && (
                        <div className="grid gap-2">
                            <Label>Ví</Label>
                            <Select name="wallet_id" required>
                                <SelectTrigger><SelectValue placeholder="Chọn ví" /></SelectTrigger>
                                <SelectContent>{wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(w.balance)})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Category (Chỉ hiện khi Chi/Thu) */}
                    {type === "expense" && (
                        <div className="grid gap-2">
                            <Label>Mức độ</Label>
                            <Select name="category" required><SelectTrigger><SelectValue placeholder="Chọn mức độ" /></SelectTrigger><SelectContent><SelectItem value="must_have">🔴 Must Have</SelectItem><SelectItem value="nice_to_have">🟡 Nice to Have</SelectItem><SelectItem value="waste">⚫ Waste</SelectItem></SelectContent></Select>
                        </div>
                    )}
                    {type === "income" && (
                        <div className="grid gap-2">
                            <Label>Nguồn thu</Label>
                            <Select name="category" required><SelectTrigger><SelectValue placeholder="Chọn nguồn" /></SelectTrigger><SelectContent><SelectItem value="salary">💵 Lương</SelectItem><SelectItem value="other_income">💎 Khác</SelectItem></SelectContent></Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>Ghi chú</Label>
                        <Input name="note" placeholder="..." />
                    </div>

                    <Button type="submit" disabled={loading} className="mt-4 w-full text-lg py-6" style={{ backgroundColor: '#598c58' }}>
                        {loading ? "Đang xử lý..." : "Xác Nhận"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}