"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Wallet, Shield, PiggyBank, TrendingUp, Banknote } from "lucide-react"
import WalletCard from "./wallet-card"
import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { EMERGENCY_FUND_DANGER_MONTHS, EMERGENCY_FUND_SAFE_MONTHS } from "@/utils/constants";
import { COLOR_POSITIVE, COLOR_NEGATIVE, COLOR_NEUTRAL } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

interface FundGroupProps {
    fundName: string;
    totalBalance: number;
    wallets: any[];
    fundsList: any[];
    minMonthlySpend?: number; // For Emergency Fund calculation
}

// Map fund names to icons
const getFundIcon = (fundName: string) => {
    const iconMap: Record<string, any> = {
        'Tiền mặt': Banknote,
        'Daily Expenses': Banknote,
        'Quỹ dự phòng khẩn cấp': Shield,
        'Quỹ dự phòng': Shield,
        'Emergency Fund': Shield,
        'Quỹ kế hoạch': PiggyBank,
        'Sinking Fund': PiggyBank,
        'Quỹ đầu tư': TrendingUp,
        'Investment Fund': TrendingUp,
        'Invesment Fund': TrendingUp,
    };
    return iconMap[fundName] || Wallet;
};

// Check if this is an Emergency Fund
const isEmergencyFund = (fundName: string) => {
    return fundName === 'Emergency Fund' || fundName === 'Quỹ dự phòng khẩn cấp' || fundName === 'Quỹ dự phòng';
};

export default function FundGroup({ fundName, totalBalance, wallets, fundsList, minMonthlySpend }: FundGroupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useTranslation();

    const IconComponent = getFundIcon(fundName);

    // Get display name based on current language
    const getDisplayName = (name: string) => {
        const viNames: Record<string, string> = {
            'Daily Expenses': t.FUND_DAILY_EXPENSES,
            'Emergency Fund': t.FUND_EMERGENCY,
            'Quỹ dự phòng khẩn cấp': t.FUND_EMERGENCY,
            'Sinking Fund': t.FUND_SINKING,
            'Investment Fund': t.FUND_INVESTMENT,
            'Invesment Fund': t.FUND_INVESTMENT,
        };
        return viNames[name] || name;
    };

    const displayName = getDisplayName(fundName);

    // Emergency Fund Status calculation
    let emergencyMonths = 0;
    let emergencyColor = COLOR_NEUTRAL;
    let showEmergencyStatus = false;

    if (isEmergencyFund(fundName) && minMonthlySpend && minMonthlySpend > 0) {
        showEmergencyStatus = true;
        emergencyMonths = totalBalance / minMonthlySpend;

        if (emergencyMonths >= EMERGENCY_FUND_SAFE_MONTHS) {
            emergencyColor = COLOR_POSITIVE;
        } else if (emergencyMonths >= EMERGENCY_FUND_DANGER_MONTHS) {
            emergencyColor = COLOR_NEUTRAL;
        } else {
            emergencyColor = COLOR_NEGATIVE;
        }
    }

    return (
        <div className="mb-3 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* HEADER - Click to toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
            >
                <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown size={18} style={{ color: COLOR_NEUTRAL }} /> : <ChevronRight size={18} style={{ color: COLOR_NEUTRAL }} />}

                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl" style={{ backgroundColor: `${COLOR_POSITIVE}15` }}>
                            <IconComponent size={18} style={{ color: COLOR_POSITIVE }} />
                        </div>
                        <div>
                            <span className="font-bold text-gray-800">{displayName}</span>
                            {showEmergencyStatus && (
                                <span
                                    className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        backgroundColor: `${emergencyColor}15`,
                                        color: emergencyColor
                                    }}
                                >
                                    ~{emergencyMonths.toFixed(1)} {t.LABEL_MONTHS}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="font-bold" style={{ color: totalBalance >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE }}>
                    <PrivacyAmount amount={totalBalance} />
                </div>
            </div>

            {/* BODY - List of Wallets */}
            {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                    {wallets.length === 0 ? (
                        <p className="text-sm italic text-center py-3" style={{ color: COLOR_NEUTRAL }}>{t.LABEL_NO_WALLETS_IN_FUND}</p>
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
