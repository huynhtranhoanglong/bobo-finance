"use client";

import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { formatCurrency, type LocaleType } from "@/utils/format";

interface PrivacyAmountProps {
    amount: number;
    className?: string;
}

export function PrivacyAmount({ amount, className = "" }: PrivacyAmountProps) {
    const { isPrivacyMode } = usePrivacy();
    const { language } = useLanguage();

    if (isPrivacyMode) {
        return <span className={className}>******</span>;
    }

    return <span className={className}>{formatCurrency(amount, language as LocaleType)}</span>;
}
