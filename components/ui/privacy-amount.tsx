"use client";

import { usePrivacy } from "@/components/providers/privacy-provider";
import { cn } from "@/lib/utils";

interface PrivacyAmountProps {
    amount: number;
    className?: string;
    currency?: string;
}

export function PrivacyAmount({ amount, className = "", currency = "VND" }: PrivacyAmountProps) {
    const { isPrivacyMode } = usePrivacy();

    const formatMoney = (value: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(value);

    if (isPrivacyMode) {
        // Keep the color (e.g., red/green) but mask the value
        return <span className={cn("font-mono tracking-widest", className)}>******</span>;
    }

    return <span className={className}>{formatMoney(amount)}</span>;
}
