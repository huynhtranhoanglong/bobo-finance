"use client"

import { useState } from "react"
import { ArrowRight, ArrowRightLeft, CreditCard, Wallet } from "lucide-react"
import EditTransactionDialog from "./edit-transaction-dialog"
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { COLOR_POSITIVE, COLOR_NEGATIVE, COLOR_NEUTRAL } from "@/utils/colors";

export default function TransactionItem({ transaction, wallets, onSuccess }: { transaction: any, wallets: any[], onSuccess?: () => void }) {
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
    let amountColor = COLOR_NEUTRAL;
    let cardBackground = `${COLOR_NEUTRAL}15`;
    let sign = "";

    if (transaction.type === 'income') {
        icon = <ArrowRight className="h-5 w-5 rotate-45" />;
        amountColor = COLOR_POSITIVE;
        cardBackground = `${COLOR_POSITIVE}15`;
        sign = "+";
    } else if (transaction.type === 'expense') {
        icon = <ArrowRight className="h-5 w-5 -rotate-45" />;
        amountColor = COLOR_NEGATIVE;
        cardBackground = `${COLOR_NEGATIVE}15`;
        sign = "-";
    } else if (transaction.type === 'transfer_out' || transaction.type === 'transfer_in') {
        icon = <ArrowRightLeft className="h-5 w-5" />;
        amountColor = COLOR_NEUTRAL;
        cardBackground = `${COLOR_NEUTRAL}15`;
    } else if (transaction.type === 'debt_repayment') {
        icon = <CreditCard className="h-5 w-5" />;
        amountColor = COLOR_NEUTRAL;
        cardBackground = `${COLOR_NEUTRAL}15`;
        sign = "-";
    }

    return (
        <>
            {/* Clickable Card */}
            <div
                onClick={() => setIsEditOpen(true)}
                className="p-4 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                style={{ backgroundColor: cardBackground }}
            >
                <div className="flex items-start justify-between gap-3">
                    {/* Left side: Icon + Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2.5 rounded-xl bg-white/60 flex-shrink-0">
                            <div style={{ color: amountColor }}>
                                {icon}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                                {transaction.note || (transaction.type === 'debt_repayment' ? 'Trả nợ' : 'Giao dịch')}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {transaction.wallets?.name || "Ví đã xóa"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatDate(transaction.date)}
                            </p>
                        </div>
                    </div>

                    {/* Right side: Amount */}
                    <div className="font-bold text-lg flex-shrink-0" style={{ color: amountColor }}>
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
                    onSuccess={onSuccess}
                />
            )}
        </>
    )
}