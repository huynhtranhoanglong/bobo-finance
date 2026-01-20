"use client";

import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { COLORS } from "@/utils/colors";
import { useTranslation } from "@/components/providers/language-provider";

interface FinancialProgressProps {
    metrics: {
        net_worth: number;
        min_monthly_spend: number;
        std_monthly_spend: number;
        safety_target: number;
        freedom_target: number;
        safety_progress: number;
        freedom_progress: number;
    };
}

export default function FinancialProgress({ metrics }: FinancialProgressProps) {
    const { t } = useTranslation();

    if (!metrics) return null;

    // Determine which milestone to show
    const hasReachedSafety = metrics.safety_progress >= 100;
    const currentProgress = hasReachedSafety ? metrics.freedom_progress : metrics.safety_progress;
    const currentTarget = hasReachedSafety ? metrics.freedom_target : metrics.safety_target;
    const targetLabel = hasReachedSafety ? t.LABEL_FREEDOM_TARGET : t.LABEL_SAFETY_TARGET;
    const targetTooltip = hasReachedSafety ? t.TOOLTIP_FREEDOM_TARGET : t.TOOLTIP_SAFETY_TARGET;
    const remaining = currentTarget - metrics.net_worth;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.LABEL_FINANCIAL_PROGRESS}</h3>

            {/* Spending Stats - 2 columns */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        {t.LABEL_MIN_MONTHLY_SPEND}
                        <HelpTooltip content={t.TOOLTIP_MIN_MONTHLY_SPEND} size={12} />
                    </p>
                    <p className="font-semibold text-gray-800 text-sm">
                        <PrivacyAmount amount={metrics.min_monthly_spend} />
                        <span className="text-gray-400 font-normal">{t.LABEL_PER_MONTH}</span>
                    </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        {t.LABEL_STD_MONTHLY_SPEND}
                        <HelpTooltip content={t.TOOLTIP_STD_MONTHLY_SPEND} size={12} />
                    </p>
                    <p className="font-semibold text-gray-800 text-sm">
                        <PrivacyAmount amount={metrics.std_monthly_spend} />
                        <span className="text-gray-400 font-normal">{t.LABEL_PER_MONTH}</span>
                    </p>
                </div>
            </div>

            {/* Progress Label */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    {t.LABEL_TARGET} {targetLabel}
                    <HelpTooltip content={targetTooltip} size={12} />
                </span>
                <span className="text-sm font-bold" style={{ color: COLORS.brand }}>
                    {Math.min(currentProgress, 100).toFixed(1)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full transition-all duration-500"
                    style={{
                        width: `${Math.min(currentProgress, 100)}%`,
                        backgroundColor: COLORS.brand
                    }}
                />
            </div>

            {/* Remaining Text */}
            <p className="text-sm text-center" style={{ color: COLORS.neutral }}>
                {t.LABEL_REMAINING_TO_TARGET
                    .replace("{amount}", "")
                    .replace("{target}", targetLabel)
                    .split("")[0] === "C"
                    ? <>Còn <span className="font-semibold"><PrivacyAmount amount={Math.max(remaining, 0)} /></span> nữa để đạt {targetLabel}</>
                    : <><span className="font-semibold"><PrivacyAmount amount={Math.max(remaining, 0)} /></span> more to reach {targetLabel}</>
                }
            </p>
        </div>
    );
}
