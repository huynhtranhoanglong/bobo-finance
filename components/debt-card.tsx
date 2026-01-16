"use client"

import { useState } from "react";
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import EditDebtDialog from "./edit-debt-dialog";
import { useRouter } from "next/navigation";
import { DEBT_PROGRESS_LOW, DEBT_PROGRESS_HIGH } from "@/utils/constants";
import { COLOR_POSITIVE, COLOR_NEGATIVE, COLOR_NEUTRAL } from "@/utils/colors";

interface DebtCardProps {
    debt: {
        id: string;
        name: string;
        remaining_amount: number;
        total_amount: number;
        type: string;
    };
    wallets?: any[];
}

export default function DebtCard({ debt, wallets }: DebtCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter(); // To refresh page after update
    const { name, remaining_amount, total_amount } = debt;

    // Calculate progress (% paid)
    const paidAmount = total_amount - remaining_amount;
    const progressPercent = total_amount > 0 ? (paidAmount / total_amount) * 100 : 0;

    // Determine color based on progress
    let progressColor = COLOR_NEGATIVE;
    if (progressPercent >= DEBT_PROGRESS_HIGH) {
        progressColor = COLOR_POSITIVE; // Almost done
    } else if (progressPercent >= DEBT_PROGRESS_LOW) {
        progressColor = COLOR_NEUTRAL; // In progress
    }

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <>
            <div
                onClick={() => setIsEditOpen(true)}
                className="p-4 bg-white rounded-2xl border shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-200"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{name}</span>
                        <span
                            className="text-[10px] font-medium uppercase"
                            style={{ color: debt.type === 'receivable' ? COLOR_POSITIVE : COLOR_NEGATIVE }}
                        >
                            {debt.type === 'receivable' ? 'Đang cho vay' : 'Nợ phải trả'}
                        </span>
                    </div>
                    <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                            backgroundColor: `${progressColor}15`,
                            color: progressColor
                        }}
                    >
                        {progressPercent.toFixed(0)}% {debt.type === 'receivable' ? 'đã được trả' : 'đã trả'}
                    </span>
                </div>

                {/* Amount Info */}
                <div className="flex justify-between items-center mb-3 text-sm">
                    <span style={{ color: COLOR_NEUTRAL }}>Còn nợ</span>
                    <div>
                        <span className="font-bold" style={{ color: COLOR_NEGATIVE }}>
                            <PrivacyAmount amount={remaining_amount} />
                        </span>
                        <span className="mx-1" style={{ color: COLOR_NEUTRAL }}>/</span>
                        <span style={{ color: COLOR_NEUTRAL }}>
                            <PrivacyAmount amount={total_amount} />
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: progressColor
                        }}
                    />
                </div>
            </div>

            {isEditOpen && (
                <EditDebtDialog
                    open={isEditOpen}
                    setOpen={setIsEditOpen}
                    debt={debt}
                    wallets={wallets}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
