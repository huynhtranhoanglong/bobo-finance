"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTransactionAction, deleteTransactionAction } from "@/app/actions"
import { Trash2, Loader2, Calendar } from "lucide-react"
import { WalletOption } from "@/components/ui/wallet-option"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/utils/categories"

interface ActiveEvent {
    id: string;
    name: string;
}

interface EditTransactionDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    transaction: any;
    wallets: any[];
    activeEvents?: ActiveEvent[];
    onSuccess?: () => void;
}

export default function EditTransactionDialog({ open, setOpen, transaction, wallets, activeEvents = [], onSuccess }: EditTransactionDialogProps) {
    const { t } = useTranslation()
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
        if (!confirm(t.LABEL_DELETE_TRANSACTION_CONFIRM)) return;

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
                    <DialogTitle className="text-center text-xl">{t.LABEL_EDIT_TRANSACTION}</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">

                    {/* 1. SỐ TIỀN */}
                    <div className="grid gap-2">
                        <Label>{t.LABEL_AMOUNT}</Label>
                        <MoneyInput
                            name="amount"
                            initialValue={transaction.amount}
                            required
                            className="font-bold text-lg"
                        />
                    </div>

                    {/* 2. LOẠI (Read-only) + DANH MỤC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t.LABEL_TYPE}</Label>
                            <Input disabled value={transaction.type === 'expense' ? t.LABEL_EXPENSE : transaction.type === 'income' ? t.LABEL_INCOME : transaction.type} />
                        </div>

                        {/* Chỉ hiện Category nếu là Thu/Chi */}
                        {(transaction.type === 'expense' || transaction.type === 'income') && (
                            <div className="grid gap-2">
                                <Label>{t.LABEL_CATEGORY}</Label>
                                <Select name="category" defaultValue={transaction.category_level || ""} required>
                                    <SelectTrigger><SelectValue placeholder={t.LABEL_SELECT} /></SelectTrigger>
                                    <SelectContent>
                                        {transaction.type === 'expense' ? (
                                            EXPENSE_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.key} value={cat.key}>{t[cat.labelKey]}</SelectItem>
                                            ))
                                        ) : (
                                            INCOME_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.key} value={cat.key}>{t[cat.labelKey]}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* 3. NGÀY THÁNG */}
                    <div className="grid gap-2">
                        <Label>{t.LABEL_DATE_TIME}</Label>
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
                        <Label>{t.LABEL_WALLET}</Label>
                        <Select name="wallet_id" defaultValue={transaction.wallet_id} required>
                            <SelectTrigger><SelectValue placeholder={t.LABEL_SELECT_WALLET} /></SelectTrigger>
                            <SelectContent>
                                {wallets?.map((w: any) => (
                                    <SelectItem key={w.id} value={w.id}>
                                        <WalletOption name={w.name} balance={w.balance} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 5. SỰ KIỆN (v1.6.2 - Chỉ hiện cho expense) */}
                    {transaction.type === 'expense' && activeEvents.length > 0 && (
                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: COLOR_BRAND }} />
                                {t.LABEL_BELONGS_TO_EVENT}
                            </Label>
                            <Select name="event_id" defaultValue={transaction.event_id || "none"}>
                                <SelectTrigger><SelectValue placeholder={t.LABEL_NO_EVENT} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t.LABEL_NO_EVENT}</SelectItem>
                                    {activeEvents.map(e => (
                                        <SelectItem key={e.id} value={e.id}>📅 {e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 6. GHI CHÚ */}
                    <div className="grid gap-2">
                        <Label>{t.LABEL_NOTE}</Label>
                        <Input name="note" defaultValue={transaction.note || ""} />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4"
                        style={{ backgroundColor: COLOR_BRAND }}
                    >
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.LABEL_SAVING}</> : t.LABEL_SAVE_CHANGES}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">{t.LABEL_OR}</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full flex gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {t.LABEL_DELETE_TRANSACTION}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}