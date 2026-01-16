"use client";

import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { COLOR_BRAND } from "@/utils/colors";

interface NetWorthSectionProps {
    netWorth: number;
}

export default function NetWorthSection({ netWorth }: NetWorthSectionProps) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-4">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-1">
                Tài sản ròng
            </p>
            <h2 className="text-3xl font-bold" style={{ color: COLOR_BRAND }}>
                <PrivacyAmount amount={netWorth} />
            </h2>
        </div>
    );
}
