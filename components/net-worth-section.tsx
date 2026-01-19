"use client";

import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { COLOR_BRAND } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

interface NetWorthSectionProps {
    netWorth: number;
}

export default function NetWorthSection({ netWorth }: NetWorthSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-4">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-1">
                {t.LABEL_NET_WORTH}
            </p>
            <h2 className="text-3xl font-bold" style={{ color: COLOR_BRAND }}>
                <PrivacyAmount amount={netWorth} />
            </h2>
        </div>
    );
}
