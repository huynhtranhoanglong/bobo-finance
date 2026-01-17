"use client"

import { useState } from "react"
import { Plus, ArrowRightLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addTransaction } from "@/app/actions"
import { WalletOption } from "@/components/ui/wallet-option"
import { formatCurrency } from "@/utils/format"
import { COLOR_BRAND, COLOR_BRAND_HOVER } from "@/utils/colors"
import {
    LABEL_ERROR_PREFIX, LABEL_LOADING, LABEL_CONFIRM, LABEL_EXPENSE, LABEL_INCOME, LABEL_OTHER,
    LABEL_TRANSFER, LABEL_DEBT_REPAYMENT, LABEL_ADD_TRANSACTION, LABEL_AMOUNT, LABEL_SELECT_WALLET,
    LABEL_TAKE_FROM_WALLET, LABEL_DEBT_TO_PAY, LABEL_SELECT_DEBT, LABEL_NO_DEBTS, LABEL_FROM_WALLET,
    LABEL_TO_WALLET, LABEL_SELECT, LABEL_WALLET, LABEL_CATEGORY_LEVEL, LABEL_SELECT_CATEGORY,
    LABEL_CATEGORY_MUST_HAVE, LABEL_CATEGORY_NICE_TO_HAVE, LABEL_CATEGORY_WASTE, LABEL_INCOME_SOURCE,
    LABEL_SELECT_SOURCE, LABEL_SALARY, LABEL_OTHER_INCOME, LABEL_NOTE, LABEL_REMAINING_DEBT
} from "@/utils/labels"

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
            alert(LABEL_ERROR_PREFIX + result.error);
        } else {
            setOpen(false);
            onSuccess?.(); // Trigger refresh
        }
    }

    // Tiêu đề động
    const getTitle = () => {
        switch (type) {
            case 'transfer': return LABEL_TRANSFER;
            case 'debt_repayment': return LABEL_DEBT_REPAYMENT;
            default: return LABEL_ADD_TRANSACTION;
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg text-white z-50 hover:scale-105 transition-transform"
                    style={{ backgroundColor: COLOR_BRAND }}
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

                    {/* 1. THANH CHỌN LOẠI (Segmented Group: Chi | Thu | Khác) */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setType("expense")}
                            className={`${type === "expense" ? "text-white border-transparent" : "text-gray-500 hover:text-gray-700"}`}
                            style={type === "expense" ? { backgroundColor: COLOR_BRAND } : {}}
                        >
                            💸 {LABEL_EXPENSE}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setType("income")}
                            className={`${type === "income" ? "text-white border-transparent" : "text-gray-500 hover:text-gray-700"}`}
                            style={type === "income" ? { backgroundColor: COLOR_BRAND } : {}}
                        >
                            💰 {LABEL_INCOME}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setType(type === 'transfer' || type === 'debt_repayment' ? type : 'transfer')}
                            className={`${(type === "transfer" || type === "debt_repayment") ? "text-white border-transparent" : "text-gray-500 hover:text-gray-700"}`}
                            style={(type === "transfer" || type === "debt_repayment") ? { backgroundColor: COLOR_BRAND } : {}}
                        >
                            ... {LABEL_OTHER}
                        </Button>
                    </div>

                    {/* MỞ RỘNG (Chuyển khoản / Trả nợ) - Chỉ hiện khi chọn Tab 'Khác' */}
                    {(type === 'transfer' || type === 'debt_repayment') && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <Button
                                type="button"
                                size="sm"
                                variant={type === "transfer" ? "secondary" : "ghost"}
                                onClick={() => setType("transfer")}
                                className={type === "transfer" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-500"}
                            >
                                🔄 {LABEL_TRANSFER}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={type === "debt_repayment" ? "secondary" : "ghost"}
                                onClick={() => setType("debt_repayment")}
                                className={type === "debt_repayment" ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-500"}
                            >
                                📉 {LABEL_DEBT_REPAYMENT}
                            </Button>
                        </div>
                    )}


                    {/* ==================== FORM CHUNG ==================== */}

                    {/* SỐ TIỀN (Luôn hiện) */}
                    <div className="grid gap-2">
                        <Label>{LABEL_AMOUNT}</Label>
                        <MoneyInput
                            name="amount"
                            placeholder="0"
                            required
                            className="text-lg font-bold"
                            autoFocus={false}
                        />
                    </div>

                    {/* CASE: TRẢ NỢ CŨ */}
                    {type === 'debt_repayment' && (
                        <>
                            <div className="grid gap-2">
                                <Label>{LABEL_TAKE_FROM_WALLET}</Label>
                                <Select name="wallet_id" required>
                                    <SelectTrigger><SelectValue placeholder={LABEL_SELECT_WALLET} /></SelectTrigger>
                                    <SelectContent>
                                        {wallets.map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                                <WalletOption name={w.name} balance={w.balance} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>{LABEL_DEBT_TO_PAY}</Label>
                                <Select name="debt_id" required>
                                    <SelectTrigger><SelectValue placeholder={LABEL_SELECT_DEBT} /></SelectTrigger>
                                    <SelectContent>
                                        {debts.filter(d => d.type === 'payable').map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name} ({LABEL_REMAINING_DEBT}: {formatCurrency(d.remaining_amount)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {debts.length === 0 && <p className="text-xs text-red-500">{LABEL_NO_DEBTS}</p>}
                            </div>
                        </>
                    )}

                    {/* CASE: CHUYỂN VÍ */}
                    {type === 'transfer' && (
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                            <div className="grid gap-2">
                                <Label>{LABEL_FROM_WALLET}</Label>
                                <Select name="wallet_id" required>
                                    <SelectTrigger><SelectValue placeholder={LABEL_SELECT} /></SelectTrigger>
                                    <SelectContent>
                                        {wallets.map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                                <WalletOption name={w.name} balance={w.balance} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ArrowRightLeft className="mb-3 text-gray-400" size={20} />
                            <div className="grid gap-2">
                                <Label>{LABEL_TO_WALLET}</Label>
                                <Select name="to_wallet_id" required>
                                    <SelectTrigger><SelectValue placeholder={LABEL_SELECT} /></SelectTrigger>
                                    <SelectContent>
                                        {wallets.map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                                <WalletOption name={w.name} balance={w.balance} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* CASE: THU / CHI THƯỜNG */}
                    {(type === 'expense' || type === 'income') && (
                        <div className="grid gap-2">
                            <Label>{LABEL_WALLET}</Label>
                            <Select name="wallet_id" required>
                                <SelectTrigger><SelectValue placeholder={LABEL_SELECT_WALLET} /></SelectTrigger>
                                <SelectContent>{wallets.map(w => (
                                    <SelectItem key={w.id} value={w.id}>
                                        <WalletOption name={w.name} balance={w.balance} />
                                    </SelectItem>
                                ))}</SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Category (Chỉ hiện khi Chi/Thu) */}
                    {type === "expense" && (
                        <div className="grid gap-2">
                            <Label>{LABEL_CATEGORY_LEVEL}</Label>
                            <Select name="category" required><SelectTrigger><SelectValue placeholder={LABEL_SELECT_CATEGORY} /></SelectTrigger><SelectContent><SelectItem value="must_have">{LABEL_CATEGORY_MUST_HAVE}</SelectItem><SelectItem value="nice_to_have">{LABEL_CATEGORY_NICE_TO_HAVE}</SelectItem><SelectItem value="waste">{LABEL_CATEGORY_WASTE}</SelectItem></SelectContent></Select>
                        </div>
                    )}
                    {type === "income" && (
                        <div className="grid gap-2">
                            <Label>{LABEL_INCOME_SOURCE}</Label>
                            <Select name="category" required><SelectTrigger><SelectValue placeholder={LABEL_SELECT_SOURCE} /></SelectTrigger><SelectContent><SelectItem value="salary">{LABEL_SALARY}</SelectItem><SelectItem value="other_income">{LABEL_OTHER_INCOME}</SelectItem></SelectContent></Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>{LABEL_NOTE}</Label>
                        <Input name="note" placeholder="..." />
                    </div>

                    <Button type="submit" disabled={loading} className="mt-4 w-full text-lg py-6" style={{ backgroundColor: COLOR_BRAND }}>
                        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {LABEL_LOADING}</> : LABEL_CONFIRM}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}