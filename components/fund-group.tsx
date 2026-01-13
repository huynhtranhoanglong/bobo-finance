"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Wallet } from "lucide-react"
import WalletCard from "./wallet-card"
import { PrivacyAmount } from "@/components/ui/privacy-amount";

interface FundGroupProps {
    fundName: string;
    totalBalance: number;
    wallets: any[];
    fundsList: any[]; // Để truyền xuống WalletCard cho chức năng Edit
}

export default function FundGroup({ fundName, totalBalance, wallets, fundsList }: FundGroupProps) {
    const [isOpen, setIsOpen] = useState(false); // Mặc định đóng cho gọn, hoặc true nếu muốn mở hết

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="mb-4 bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* HEADER - Click ID toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition"
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={20} className="text-gray-500" /> : <ChevronRight size={20} className="text-gray-500" />}

                    <div className="flex items-center gap-2">
                        <div className="bg-white p-1.5 rounded-full shadow-sm">
                            <Wallet size={16} className="text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-800">{fundName}</span>
                    </div>
                </div>

                <div className="font-bold text-blue-700">
                    <PrivacyAmount amount={totalBalance} />
                </div>
            </div>

            {/* BODY - List of Wallets */}
            {isOpen && (
                <div className="p-3 bg-white border-t space-y-3">
                    {wallets.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-2">Chưa có ví nào trong quỹ này.</p>
                    ) : (
                        wallets.map(wallet => (
                            <WalletCard key={wallet.id} wallet={wallet} funds={fundsList} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
