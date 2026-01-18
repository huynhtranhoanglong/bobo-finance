"use client"

import { useState } from "react"
import { Plus, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createWalletAction } from "@/app/actions"
import { useRouter } from "next/navigation"
import { COLOR_BRAND } from "@/utils/colors"
import {
    LABEL_ERROR_PREFIX, LABEL_CREATE_WALLET, LABEL_WALLET_NAME, LABEL_WALLET_NAME_PLACEHOLDER,
    LABEL_BELONGS_TO_FUND, LABEL_SELECT_PARENT_FUND, LABEL_INITIAL_BALANCE, LABEL_INITIAL_BALANCE_NOTE,
    LABEL_CREATING, LABEL_WALLET_PRIVATE, LABEL_WALLET_PRIVATE_NOTE
} from "@/utils/labels"

interface CreateWalletDialogProps {
    funds: any[];
    hasFamily?: boolean; // Truyền từ parent để biết user có gia đình không
    defaultPrivate?: boolean; // Mặc định tạo ví private (dùng cho trang /private)
}

export default function CreateWalletDialog({ funds, hasFamily = false, defaultPrivate = false }: CreateWalletDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isPrivate, setIsPrivate] = useState(defaultPrivate)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // Append visibility to form data
        formData.append("visibility", isPrivate ? "private" : "shared");

        const result = await createWalletAction(formData);
        setLoading(false);
        if (result?.error) {
            alert(LABEL_ERROR_PREFIX + result.error);
        } else {
            setOpen(false);
            setIsPrivate(defaultPrivate); // Reset về default
            router.refresh(); // Refresh dashboard
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{LABEL_CREATE_WALLET}</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{LABEL_WALLET_NAME}</Label>
                        <Input name="name" placeholder={LABEL_WALLET_NAME_PLACEHOLDER} required />
                    </div>

                    <div className="grid gap-2">
                        <Label>{LABEL_BELONGS_TO_FUND}</Label>
                        <Select name="fund_id" required>
                            <SelectTrigger><SelectValue placeholder={LABEL_SELECT_PARENT_FUND} /></SelectTrigger>
                            <SelectContent>
                                {funds?.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>{LABEL_INITIAL_BALANCE}</Label>
                        <MoneyInput name="initial_balance" placeholder="0" required />
                        <p className="text-xs text-gray-500">
                            {LABEL_INITIAL_BALANCE_NOTE}
                        </p>
                    </div>

                    {/* Toggle ví riêng tư - chỉ hiển thị khi có gia đình */}
                    {hasFamily && (
                        <div className="flex items-center justify-between rounded-lg border p-3 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-gray-500" />
                                <div>
                                    <Label htmlFor="private-toggle" className="cursor-pointer font-medium">
                                        {LABEL_WALLET_PRIVATE}
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {LABEL_WALLET_PRIVATE_NOTE}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="private-toggle"
                                checked={isPrivate}
                                onCheckedChange={setIsPrivate}
                            />
                        </div>
                    )}

                    <Button type="submit" disabled={loading} style={{ backgroundColor: COLOR_BRAND }} className="w-full">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {LABEL_CREATING}</> : LABEL_CREATE_WALLET}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
