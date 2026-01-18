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
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"

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
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        formData.append("id", wallet.id);

        const result = await updateWalletAction(formData);
        setLoading(false);

        if (result?.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error);
        } else {
            setOpen(false);
        }
    }

    async function handleDelete() {
        if (!confirm(t.LABEL_DELETE_WALLET_CONFIRM)) {
            return;
        }

        setLoading(true);
        const result = await deleteWalletAction(wallet.id);
        setLoading(false);

        if (result?.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error);
        } else {
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">{t.LABEL_EDIT_WALLET}</DialogTitle>
                </DialogHeader>

                <form action={handleUpdate} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>{t.LABEL_WALLET_NAME}</Label>
                        <Input name="name" defaultValue={wallet.name} required />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t.LABEL_BELONGS_TO_FUND}</Label>
                        <Select name="fund_id" defaultValue={wallet.funds?.id || wallet.fund_id} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {funds.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t.LABEL_CURRENT_BALANCE}</Label>
                        <MoneyInput
                            name="balance"
                            initialValue={Number(wallet.balance)}
                            required
                            className="font-bold text-lg"
                        />
                        <p className="text-xs text-blue-600">
                            {t.LABEL_BALANCE_ADJUSTMENT_NOTE}
                        </p>
                    </div>

                    <Button type="submit" disabled={loading} className="mt-4 w-full" style={{ backgroundColor: COLOR_BRAND }}>
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
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                        {loading ? t.LABEL_DELETING : t.LABEL_DELETE_WALLET}
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    )
}
