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
import {
    LABEL_EDIT_DEBT, LABEL_DEBT_NAME, LABEL_TOTAL_DEBT_AMOUNT, LABEL_AMOUNT_PAID,
    LABEL_AMOUNT_RECEIVED, LABEL_CURRENT_REMAINING, LABEL_JUST_RECORD_EDIT,
    LABEL_WALLET_UPDATE_DIFF, LABEL_WALLET_DISABLED, LABEL_SELECT_WALLET, LABEL_WALLET_DIFF_NOTE,
    LABEL_SAVING, LABEL_SAVE_CHANGES, LABEL_OR, LABEL_DELETE_DEBT, LABEL_DELETE_DEBT_CONFIRM
} from "@/utils/labels"

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
        if (!confirm(LABEL_DELETE_DEBT_CONFIRM.replace("{name}", debt.name))) return;

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
                    <DialogTitle className="text-center text-xl">{LABEL_EDIT_DEBT}</DialogTitle>
                </DialogHeader>
                <form action={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{LABEL_DEBT_NAME}</Label>
                        <Input name="name" defaultValue={debt.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>{LABEL_TOTAL_DEBT_AMOUNT}</Label>
                        <MoneyInput
                            name="total_amount"
                            initialValue={debt.total_amount}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>{debt.type === 'receivable' ? LABEL_AMOUNT_RECEIVED : LABEL_AMOUNT_PAID}</Label>
                        <MoneyInput
                            name="paid_amount"
                            // Mặc định tính Paid = Total - Remaining nếu chưa có dữ liệu paid riêng
                            initialValue={debt.total_amount - debt.remaining_amount}
                        />
                        <p className="text-xs text-gray-500">
                            {LABEL_CURRENT_REMAINING}: {formatCurrency(debt.remaining_amount)}
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
                            {LABEL_JUST_RECORD_EDIT}
                        </Label>
                        <input type="hidden" name="just_record" value={justRecord ? "true" : "false"} />
                    </div>

                    <div className={`grid gap-2 transition-all duration-300 ${justRecord ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <Label>{LABEL_WALLET_UPDATE_DIFF}</Label>
                        <Select name="wallet_id" required={!justRecord}>
                            <SelectTrigger><SelectValue placeholder={justRecord ? LABEL_WALLET_DISABLED : LABEL_SELECT_WALLET} /></SelectTrigger>
                            <SelectContent>
                                {wallets.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name} ({formatCurrency(Number(w.balance))})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            {LABEL_WALLET_DIFF_NOTE}
                        </p>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full mt-4" style={{ backgroundColor: COLOR_BRAND }}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {LABEL_SAVING}</> : LABEL_SAVE_CHANGES}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">{LABEL_OR}</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full flex gap-2"
                        title={LABEL_DELETE_DEBT}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {LABEL_DELETE_DEBT}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}