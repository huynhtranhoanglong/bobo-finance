"use client"

import { PrivacyAmount } from "@/components/ui/privacy-amount";
import { SPENDING_PROGRESS_THRESHOLD_PERCENT } from "@/utils/constants";

interface MonthlyStatsProps {
    stats: {
        income: number;
        expense: number;
        remaining: number;
        breakdown: {
            must_have: number;
            nice_to_have: number;
            waste: number;
        };
        min_spend: number;
        std_spend?: number;
        has_debt: boolean;
    };
}

export default function MonthlyStats({ stats }: MonthlyStatsProps) {
    if (!stats) return null;

    const { income, expense, remaining, breakdown, min_spend, std_spend, has_debt } = stats;

    // === COLOR PALETTE ===
    const COLOR_POSITIVE = '#598c58';
    const COLOR_NEGATIVE = '#c25e5e';
    const COLOR_NEUTRAL = '#7a869a';

    // === PIE CHART CALCULATIONS ===
    const totalBreakdown = breakdown.must_have + breakdown.nice_to_have + breakdown.waste;
    const basis = totalBreakdown > 0 ? totalBreakdown : 1;

    const pctMustHave = (breakdown.must_have / basis) * 100;
    const pctNiceToHave = (breakdown.nice_to_have / basis) * 100;
    const pctWaste = (breakdown.waste / basis) * 100;

    // Filled Pie Chart với conic-gradient
    // Thiết yếu (Positive) -> Thứ yếu (Neutral) -> Lãng phí (Negative)
    const pieStyle = {
        background: `conic-gradient(
            ${COLOR_POSITIVE} 0% ${pctMustHave}%, 
            ${COLOR_NEUTRAL} ${pctMustHave}% ${pctMustHave + pctNiceToHave}%, 
            ${COLOR_NEGATIVE} ${pctMustHave + pctNiceToHave}% 100%
        )`
    };

    // === SPENDING PROGRESS CALCULATIONS ===
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const timeProgress = (currentDay / daysInMonth) * 100;

    // Chọn mức so sánh dựa trên có nợ hay không
    const compareTarget = has_debt ? min_spend : (std_spend || min_spend);
    const spendingProgress = compareTarget > 0 ? (expense / compareTarget) * 100 : 0;

    // Logic màu sắc: so sánh spending với time (±threshold)
    const difference = spendingProgress - timeProgress;
    let progressColor = COLOR_NEUTRAL;
    if (difference < -SPENDING_PROGRESS_THRESHOLD_PERCENT) {
        progressColor = COLOR_POSITIVE; // Tốt, chi tiêu ít hơn tiến độ thời gian
    } else if (difference > SPENDING_PROGRESS_THRESHOLD_PERCENT) {
        progressColor = COLOR_NEGATIVE; // Cảnh báo, chi tiêu vượt tiến độ
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Thống kê tháng này</h2>

            {/* 1. TỔNG QUAN: 2 HÀNG */}
            {/* Hàng 1: Thu Nhập + Chi Tiêu */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Thu Nhập */}
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: `${COLOR_POSITIVE}15` }}>
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: COLOR_NEUTRAL }}>Thu Nhập</p>
                    <p className="font-bold text-base" style={{ color: COLOR_POSITIVE }}>
                        <PrivacyAmount amount={income} />
                    </p>
                </div>
                {/* Chi Tiêu */}
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: `${COLOR_NEGATIVE}15` }}>
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: COLOR_NEUTRAL }}>Chi Tiêu</p>
                    <p className="font-bold text-base" style={{ color: COLOR_NEGATIVE }}>
                        <PrivacyAmount amount={expense} />
                    </p>
                </div>
            </div>
            {/* Hàng 2: Còn Lại (full width) */}
            <div className="p-4 rounded-xl text-center mb-6" style={{ backgroundColor: `${COLOR_NEUTRAL}10` }}>
                <p className="text-xs uppercase font-semibold mb-1" style={{ color: COLOR_NEUTRAL }}>Còn Lại</p>
                <p className="font-bold text-xl" style={{ color: remaining >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE }}>
                    <PrivacyAmount amount={remaining} />
                </p>
            </div>

            {/* 2. PIE CHART - FILLED, CENTERED */}
            <div className="flex flex-col items-center mb-6">
                {/* Pie Chart - 50% width của section */}
                <div
                    className="rounded-full mb-4"
                    style={{
                        ...pieStyle,
                        width: '50%',
                        aspectRatio: '1/1'
                    }}
                />

                {/* Legend - Horizontal dưới chart */}
                <div className="flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_POSITIVE }} />
                        <span className="text-gray-600">Thiết yếu {Math.round(pctMustHave)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_NEUTRAL }} />
                        <span className="text-gray-600">Thứ yếu {Math.round(pctNiceToHave)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_NEGATIVE }} />
                        <span className="text-gray-600">Lãng phí {Math.round(pctWaste)}%</span>
                    </div>
                </div>
            </div>

            {/* 3. TIẾN ĐỘ CHI TIÊU (NEW DESIGN) */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: `${COLOR_NEUTRAL}08` }}>
                {/* Thanh Tiến độ Thời gian */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">⏱️ Tiến độ thời gian</span>
                        <span className="text-sm font-bold" style={{ color: COLOR_NEUTRAL }}>
                            {Math.round(timeProgress)}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${timeProgress}%`, backgroundColor: COLOR_NEUTRAL }}
                        />
                    </div>
                </div>

                {/* Thanh Tiến độ Chi tiêu */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">💳 Tiến độ chi tiêu</span>
                        <span className="text-sm font-bold" style={{ color: progressColor }}>
                            {Math.round(Math.min(spendingProgress, 100))}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${Math.min(spendingProgress, 100)}%`,
                                backgroundColor: progressColor
                            }}
                        />
                    </div>
                </div>

                {/* Dòng diễn giải */}
                <p className="text-xs text-center" style={{ color: COLOR_NEUTRAL }}>
                    {has_debt
                        ? "⚠️ Bạn đang có khoản nợ, nên giữ chi tiêu ở mức tối thiểu."
                        : "💡 So sánh với mức chi tiêu tiêu chuẩn của bạn."
                    }
                </p>
            </div>
        </div>
    );
}
