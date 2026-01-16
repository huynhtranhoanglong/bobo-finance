"use client";

import { usePrivacy } from "@/components/providers/privacy-provider";
import { formatCurrency } from "@/utils/format";

interface PrivacyAmountProps {
    amount: number;
    className?: string;
}

export function PrivacyAmount({ amount, className = "" }: PrivacyAmountProps) {
    const { isPrivacyMode } = usePrivacy();

    if (isPrivacyMode) {
        return <span className={className}>******</span>;
    }

    return <span className={className}>{formatCurrency(amount)}</span>;
}

