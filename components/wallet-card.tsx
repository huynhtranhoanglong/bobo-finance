"use client"

import { useState } from "react"
import EditWalletDialog from "@/components/edit-wallet-dialog"

export default function WalletCard({ wallet, funds }: { wallet: any, funds: any[] }) {
    const [open, setOpen] = useState(false)

    // Formatter
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="p-4 border rounded-lg shadow-sm bg-white text-black transition hover:shadow-md cursor-pointer active:scale-95"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">{wallet.name}</h3>
                        <p className="text-sm text-gray-500">
                            {wallet.funds?.name || "Chưa phân loại"}
                        </p>
                    </div>
                    <div className={`text-xl font-bold ${wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(wallet.balance)}
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
