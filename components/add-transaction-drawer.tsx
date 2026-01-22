"use client"

import { useState, useEffect } from "react"
import { Loader2, ArrowRightLeft, Calendar, Minus, TrendingUp, RefreshCw, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { Label } from "@/components/ui/label"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose
} from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTransaction } from "@/app/actions"
import { WalletOption } from "@/components/ui/wallet-option"
import { formatCurrency } from "@/utils/format"
import { COLORS } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/utils/categories"

interface ActiveEvent {
    id: string;
    name: string;
}

interface AddTransactionDrawerProps {
    wallets: any[];
    debts: any[];
    funds: any[];
    activeEvents?: ActiveEvent[];
    onSuccess?: () => void;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type TransactionMode = "expense" | "income" | "transfer" | "debt_repayment";

export default function AddTransactionDrawer({
    wallets,
    debts,
    funds,
    activeEvents = [],
    onSuccess,
    trigger,
    open: controlledOpen,
    onOpenChange
}: AddTransactionDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

    const [mode, setMode] = useState<TransactionMode>("expense")
    const [loading, setLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("must_have")
    const { t } = useTranslation()

    // Smart default: wallet with highest balance
    const defaultWallet = wallets.length > 0
        ? wallets.reduce((prev, curr) => prev.balance > curr.balance ? prev : curr)
        : null;

    // Reset state when drawer opens
    useEffect(() => {
        if (open) {
            setMode("expense")
            setSelectedCategory("must_have")
        }
    }, [open])

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        formData.append("type", mode);

        // Add selected category for expense
        if (mode === "expense") {
            formData.set("category", selectedCategory);
        }

        // Client-side validation for Transfer
        if (mode === 'transfer') {
            const fromWallet = formData.get("wallet_id");
            const toWallet = formData.get("to_wallet_id");
            if (fromWallet && toWallet && fromWallet === toWallet) {
                alert(t.LABEL_ERROR_PREFIX + t.ERROR_SAME_WALLET_TRANSFER);
                setLoading(false);
                return;
            }
        }

        const result = await addTransaction(formData);
        setLoading(false);

        if (result?.error) {
            alert(t.LABEL_ERROR_PREFIX + result.error);
        } else {
            setOpen(false);
            onSuccess?.();
        }
    }

    // Category Segment Control (for expense) - 4 columns including "Other"
    const CategorySegment = () => (
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/50 rounded-2xl">
            {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                const colors: Record<string, string> = {
                    must_have: COLORS.mustHave,
                    nice_to_have: COLORS.niceToHave,
                    waste: COLORS.waste,
                    other_expense: COLORS.neutral
                };
                return (
                    <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all text-center ${isSelected
                            ? "bg-white shadow-sm"
                            : "hover:bg-white/50"
                            }`}
                        style={isSelected ? { color: colors[cat.key] || COLORS.brand } : { color: '#64748b' }}
                    >
                        {t[cat.labelKey]}
                    </button>
                );
            })}
        </div>
    );

    // Mode Tab (Small links at bottom)
    const ModeLinks = () => (
        <div className="flex items-center justify-center gap-4 text-sm pt-2">
            <button
                type="button"
                onClick={() => setMode(mode === "income" ? "expense" : "income")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${mode === "income"
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
            >
                <TrendingUp size={14} />
                {t.LABEL_INCOME}
            </button>
            <button
                type="button"
                onClick={() => setMode(mode === "transfer" ? "expense" : "transfer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${mode === "transfer"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
            >
                <RefreshCw size={14} />
                {t.LABEL_TRANSFER}
            </button>
            {debts.length > 0 && (
                <button
                    type="button"
                    onClick={() => setMode(mode === "debt_repayment" ? "expense" : "debt_repayment")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${mode === "debt_repayment"
                        ? "bg-orange-100 text-orange-700 font-medium"
                        : "text-slate-400 hover:text-slate-600"
                        }`}
                >
                    <CreditCard size={14} />
                    {t.LABEL_DEBT_REPAYMENT}
                </button>
            )}
        </div>
    );

    // Title based on mode
    const getTitle = () => {
        switch (mode) {
            case 'income': return `💰 ${t.LABEL_INCOME}`;
            case 'transfer': return `🔄 ${t.LABEL_TRANSFER}`;
            case 'debt_repayment': return `📉 ${t.LABEL_DEBT_REPAYMENT}`;
            default: return `💸 ${t.LABEL_EXPENSE}`;
        }
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-lg overflow-y-auto">
                    <DrawerHeader className="pb-2">
                        <DrawerTitle className="text-xl text-center font-bold">
                            {getTitle()}
                        </DrawerTitle>
                    </DrawerHeader>

                    <form action={handleSubmit} className="px-6 pb-6 space-y-5">

                        {/* Amount Input - Hero Style */}
                        <div className="text-center py-4">
                            <MoneyInput
                                name="amount"
                                placeholder="0"
                                required
                                className="text-center text-4xl font-bold h-16 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 placeholder:text-slate-300"
                                autoFocus
                            />
                            <p className="text-slate-400 text-sm mt-1">{t.LABEL_AMOUNT}</p>
                        </div>

                        {/* === EXPENSE MODE === */}
                        {mode === "expense" && (
                            <>
                                {/* Wallet & Category in 2 columns */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_WALLET}</Label>
                                        <Select name="wallet_id" required defaultValue={defaultWallet?.id}>
                                            <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white overflow-hidden">
                                                <SelectValue placeholder={t.LABEL_SELECT_WALLET} className="truncate" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wallets.map(w => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        <WalletOption name={w.name} balance={w.balance} />
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {activeEvents.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-slate-500 text-xs font-medium ml-1 flex items-center gap-1">
                                                <Calendar size={12} style={{ color: COLORS.brand }} />
                                                {t.LABEL_BELONGS_TO_EVENT}
                                            </Label>
                                            <Select name="event_id">
                                                <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white">
                                                    <SelectValue placeholder={t.LABEL_NO_EVENT} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">{t.LABEL_NO_EVENT}</SelectItem>
                                                    {activeEvents.map(e => (
                                                        <SelectItem key={e.id} value={e.id}>📅 {e.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {activeEvents.length === 0 && (
                                        <div /> // Empty placeholder for grid alignment
                                    )}
                                </div>

                                {/* Category Segment */}
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_CATEGORY_LEVEL}</Label>
                                    <CategorySegment />
                                </div>
                            </>
                        )}

                        {/* === INCOME MODE === */}
                        {mode === "income" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_WALLET}</Label>
                                    <Select name="wallet_id" required defaultValue={defaultWallet?.id}>
                                        <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white overflow-hidden">
                                            <SelectValue placeholder={t.LABEL_SELECT_WALLET} className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wallets.map(w => (
                                                <SelectItem key={w.id} value={w.id}>
                                                    <WalletOption name={w.name} balance={w.balance} />
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_INCOME_SOURCE}</Label>
                                    <Select name="category" required defaultValue="main_income">
                                        <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white">
                                            <SelectValue placeholder={t.LABEL_SELECT_SOURCE} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INCOME_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.key} value={cat.key}>{t[cat.labelKey]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* === TRANSFER MODE === */}
                        {mode === "transfer" && (
                            <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_FROM_WALLET}</Label>
                                    <Select name="wallet_id" required>
                                        <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white overflow-hidden">
                                            <SelectValue placeholder={t.LABEL_SELECT} className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wallets.map(w => (
                                                <SelectItem key={w.id} value={w.id}>
                                                    <WalletOption name={w.name} balance={w.balance} />
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <ArrowRightLeft className="mb-4 text-slate-300" size={20} />
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_TO_WALLET}</Label>
                                    <Select name="to_wallet_id" required>
                                        <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white overflow-hidden">
                                            <SelectValue placeholder={t.LABEL_SELECT} className="truncate" />
                                        </SelectTrigger>
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

                        {/* === DEBT REPAYMENT MODE === */}
                        {mode === "debt_repayment" && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_TAKE_FROM_WALLET}</Label>
                                        <Select name="wallet_id" required defaultValue={defaultWallet?.id}>
                                            <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white overflow-hidden">
                                                <SelectValue placeholder={t.LABEL_SELECT_WALLET} className="truncate" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wallets.map(w => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        <WalletOption name={w.name} balance={w.balance} />
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_DEBT_TO_PAY}</Label>
                                        <Select name="debt_id" required>
                                            <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white">
                                                <SelectValue placeholder={t.LABEL_SELECT_DEBT} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {debts.filter(d => d.type === 'payable').map(d => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name} ({formatCurrency(d.remaining_amount)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {debts.length === 0 && (
                                    <p className="text-xs text-rose-500 text-center">{t.LABEL_NO_DEBTS}</p>
                                )}
                            </div>
                        )}

                        {/* Note Input */}
                        <div className="space-y-2">
                            <Label className="text-slate-500 text-xs font-medium ml-1">{t.LABEL_NOTE}</Label>
                            <Input
                                name="note"
                                placeholder={t.LABEL_ENTER_NOTE}
                                className="h-12 rounded-xl bg-white/50 border-slate-100 focus:bg-white placeholder:text-slate-300"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                backgroundColor: COLORS.brand,
                                boxShadow: `0 10px 25px -5px ${COLORS.brand}40`
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {t.LABEL_LOADING}
                                </>
                            ) : (
                                t.LABEL_CONFIRM
                            )}
                        </Button>

                        {/* Mode Switch Links */}
                        <ModeLinks />

                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
