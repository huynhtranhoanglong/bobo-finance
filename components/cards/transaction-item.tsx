"use client"

import { useState } from "react"
import { ArrowRight, ArrowRightLeft, CreditCard, Wallet } from "lucide-react"
import EditTransactionDialog from "@/components/dialogs/edit-transaction-dialog"
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { COLORS } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

interface ActiveEvent {
    id: string;
    name: string;
}

interface TransactionItemProps {
    transaction: any;
    wallets: any[];
    activeEvents?: ActiveEvent[];
    onSuccess?: () => void;
}

export default function TransactionItem({ transaction, wallets, activeEvents = [], onSuccess }: TransactionItemProps) {
    const { t } = useTranslation()
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // Determine icon, color, background based on transaction type
    let icon = <Wallet className="h-5 w-5" />;
    let amountColor: string = COLORS.neutral;
    let iconBgColor: string = "bg-slate-100";
    let iconColor: string = "text-slate-600";
    let sign = "";

    // Colored shadow for the card
    let shadowClass = "shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]";
    let hoverShadowClass = "hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)]";

    if (transaction.type === 'income') {
        icon = <ArrowRight className="h-5 w-5 rotate-45" />;
        amountColor = COLORS.income;
        iconBgColor = "bg-emerald-100";
        iconColor = "text-emerald-600";
        shadowClass = "shadow-[0_4px_15px_-4px_rgba(16,185,129,0.1)]";
        hoverShadowClass = "hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.2)]";
        sign = "+";
    } else if (transaction.type === 'expense') {
        icon = <ArrowRight className="h-5 w-5 -rotate-45" />;
        amountColor = COLORS.expense;
        iconBgColor = "bg-rose-100";
        iconColor = "text-rose-600";
        shadowClass = "shadow-[0_4px_15px_-4px_rgba(244,63,94,0.1)]";
        hoverShadowClass = "hover:shadow-[0_10px_25px_-5px_rgba(244,63,94,0.2)]";
        sign = "-";
    } else if (transaction.type === 'transfer_out' || transaction.type === 'transfer_in') {
        icon = <ArrowRightLeft className="h-5 w-5" />;
        amountColor = COLORS.transfer;
        iconBgColor = "bg-blue-100";
        iconColor = "text-blue-600";
        sign = transaction.type === 'transfer_out' ? "-" : "+";
    } else if (transaction.type === 'debt_repayment') {
        icon = <CreditCard className="h-5 w-5" />;
        amountColor = COLORS.neutral;
        iconBgColor = "bg-slate-100";
        iconColor = "text-slate-600";
        sign = "-";
    }

    return (
        <>
            {/* Clickable Card - Soft UI Style */}
            <div
                onClick={() => setIsEditOpen(true)}
                className={`group p-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-white/90 ${shadowClass} ${hoverShadowClass}`}
            >
                <div className="flex items-start justify-between gap-4">
                    {/* Left side: Icon + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-2xl ${iconBgColor} ${iconColor} flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className="font-bold text-slate-800 truncate text-[15px] group-hover:text-emerald-700 transition-colors">
                                {transaction.note || (transaction.type === 'debt_repayment' ? t.LABEL_DEBT_REPAYMENT : t.LABEL_TRANSACTION)}
                            </p>

                            <div className="flex flex-col gap-0.5 mt-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Wallet size={12} className="text-slate-400" />
                                    <span>{transaction.wallets?.name || t.LABEL_DELETED_WALLET}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium ml-4.5">
                                    {formatDate(transaction.date)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Amount */}
                    <div className="font-bold text-lg flex-shrink-0 pt-1 tracking-tight" style={{ color: amountColor }}>
                        {sign}<PrivacyAmount amount={transaction.amount} />
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            {isEditOpen && (
                <EditTransactionDialog
                    open={isEditOpen}
                    setOpen={setIsEditOpen}
                    transaction={transaction}
                    wallets={wallets}
                    activeEvents={activeEvents}
                    onSuccess={onSuccess}
                />
            )}
        </>
    )
}