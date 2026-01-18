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
import { WalletOption } from "@/components/ui/wallet-option"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"

export default function CreateDebtDialog({ wallets }: { wallets: any[] }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [debtType, setDebtType] = useState("payable")
    const [justRecord, setJustRecord] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append("type", "create_debt");
        formData.append("debt_type", debtType);

        const result = await addTransaction(formData);
        setLoading(false);

        if (result?.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error);
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
                    <DialogTitle>{t.LABEL_CREATE_DEBT}</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    {/* Chọn loại nợ */}
                    <div className="flex gap-4 justify-center bg-gray-50 p-2 rounded-lg">
                        <div
                            className={`cursor-pointer px-4 py-2 rounded-md border transition-all ${debtType === 'payable' ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm' : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'}`}
                            onClick={() => setDebtType('payable')}
                        >
                            {t.LABEL_DEBT_PAYABLE_FULL}
                        </div>
                        <div
                            className={`cursor-pointer px-4 py-2 rounded-md border transition-all ${debtType === 'receivable' ? 'bg-green-50 border-green-500 text-green-700 font-bold shadow-sm' : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'}`}
                            onClick={() => setDebtType('receivable')}
                        >
                            {t.LABEL_DEBT_RECEIVABLE}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t.LABEL_DEBT_NAME}</Label>
                        <Input name="debt_name" placeholder="Vd: Vay ngân hàng, Cho Tuấn mượn..." required />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t.LABEL_DEBT_AMOUNT}</Label>
                        <MoneyInput name="amount" placeholder="0" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>{debtType === 'receivable' ? t.LABEL_AMOUNT_RECEIVED : t.LABEL_AMOUNT_PAID}</Label>
                        <MoneyInput name="paid_amount" placeholder="0" />
                        <p className="text-xs text-gray-500">{t.LABEL_NEW_DEBT_NOTE}</p>
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
                            {t.LABEL_JUST_RECORD}
                        </Label>
                        <input type="hidden" name="just_record" value={justRecord ? "true" : "false"} />
                    </div>

                    <div className={`grid gap-2 transition-all duration-300 ${justRecord ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <Label>{debtType === 'payable' ? t.LABEL_WALLET_RECEIVE : t.LABEL_WALLET_TAKE}</Label>
                        <Select name="wallet_id" required={!justRecord}>
                            <SelectTrigger><SelectValue placeholder={justRecord ? t.LABEL_WALLET_DISABLED : t.LABEL_SELECT_WALLET} /></SelectTrigger>
                            <SelectContent>
                                {wallets.map(w => (
                                    <SelectItem key={w.id} value={w.id}>
                                        <WalletOption name={w.name} balance={w.balance} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            {justRecord ? t.LABEL_JUST_RECORD_NOTE : t.LABEL_WALLET_SYNC_NOTE}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t.LABEL_INTEREST_LEVEL}</Label>
                        <Select name="interest_level" defaultValue="none">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t.LABEL_INTEREST_NONE}</SelectItem>
                                <SelectItem value="low">{t.LABEL_INTEREST_LOW}</SelectItem>
                                <SelectItem value="medium">{t.LABEL_INTEREST_MEDIUM}</SelectItem>
                                <SelectItem value="high">{t.LABEL_INTEREST_HIGH}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>{t.LABEL_NOTE}</Label>
                        <Input name="note" placeholder="..." />
                    </div>

                    <Button type="submit" disabled={loading} style={{ backgroundColor: COLOR_BRAND }} className="w-full mt-2">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.LABEL_LOADING}</> : t.LABEL_CREATE_DEBT}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
