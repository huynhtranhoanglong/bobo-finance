"use client";

import { PrivacyAmount } from "@/components/ui/privacy-amount";

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
    if (!metrics) return null;

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

    // Determine which milestone to show
    const hasReachedSafety = metrics.safety_progress >= 100;
    const currentProgress = hasReachedSafety ? metrics.freedom_progress : metrics.safety_progress;
    const currentTarget = hasReachedSafety ? metrics.freedom_target : metrics.safety_target;
    const targetLabel = hasReachedSafety ? "Độc lập tài chính" : "An toàn tài chính";
    const remaining = currentTarget - metrics.net_worth;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Tiến độ tài chính</h3>

            {/* Spending Stats - 2 columns */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Chi tiêu tối thiểu</p>
                    <p className="font-semibold text-gray-800 text-sm">
                        <PrivacyAmount amount={metrics.min_monthly_spend} />
                        <span className="text-gray-400 font-normal">/tháng</span>
                    </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Chi tiêu tiêu chuẩn</p>
                    <p className="font-semibold text-gray-800 text-sm">
                        <PrivacyAmount amount={metrics.std_monthly_spend} />
                        <span className="text-gray-400 font-normal">/tháng</span>
                    </p>
                </div>
            </div>

            {/* Progress Label */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                    🎯 Mục tiêu: {targetLabel}
                </span>
                <span className="text-sm font-bold" style={{ color: '#598c58' }}>
                    {Math.min(currentProgress, 100).toFixed(1)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full transition-all duration-500"
                    style={{
                        width: `${Math.min(currentProgress, 100)}%`,
                        backgroundColor: '#598c58'
                    }}
                />
            </div>

            {/* Remaining Text */}
            <p className="text-sm text-center" style={{ color: '#7a869a' }}>
                Còn <span className="font-semibold"><PrivacyAmount amount={Math.max(remaining, 0)} /></span> nữa để đạt {targetLabel}
            </p>
        </div>
    );
}
