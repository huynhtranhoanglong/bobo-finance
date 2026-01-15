"use client"

import { useState } from "react"
import EditWalletDialog from "@/components/edit-wallet-dialog"
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { CreditCard } from "lucide-react"

// Color palette
const COLOR_POSITIVE = '#598c58';
const COLOR_NEGATIVE = '#c25e5e';
const COLOR_NEUTRAL = '#7a869a';

export default function WalletCard({ wallet, funds }: { wallet: any, funds: any[] }) {
    const [open, setOpen] = useState(false)

    const balanceColor = Number(wallet.balance) >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE;

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer active:scale-[0.98]"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CreditCard size={16} style={{ color: COLOR_NEUTRAL }} />
                        </div>
                        <span className="font-medium text-gray-800">{wallet.name}</span>
                    </div>
                    <div className="font-bold" style={{ color: balanceColor }}>
                        <PrivacyAmount amount={Number(wallet.balance)} />
                    </div>
                </div>
            </div>

            <EditWalletDialog
                wallet={wallet}
                funds={funds}
                open={open}
                setOpen={setOpen}
            />
        </>
    )
}
