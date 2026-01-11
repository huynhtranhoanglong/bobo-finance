"use client"

import { AlertTriangle, TrendingUp, TrendingDown, Wallet } from "lucide-react"

export default function MonthlyStats({ stats }: { stats: any }) {
    if (!stats) return null;

    const { income, expense, remaining, breakdown, min_spend, has_debt } = stats;

    // Format tiền
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Tính toán cho Pie Chart
    const totalBreakdown = breakdown.must_have + breakdown.nice_to_have + breakdown.waste;
    // Tránh chia cho 0
    const basis = totalBreakdown > 0 ? totalBreakdown : 1;

    const pctMustHave = (breakdown.must_have / basis) * 100;
    const pctNiceToHave = (breakdown.nice_to_have / basis) * 100;
    const pctWaste = (breakdown.waste / basis) * 100;

    // CSS Conic Gradient cho Pie Chart
    // MustHave (Red) -> NiceToHave (Yellow) -> Waste (Gray)
    const pieStyle = {
        background: `conic-gradient(
            #ef4444 0% ${pctMustHave}%, 
            #eab308 ${pctMustHave}% ${pctMustHave + pctNiceToHave}%, 
            #94a3b8 ${pctMustHave + pctNiceToHave}% 100%
        )`
    };

    // Logic Cảnh báo Chi tiêu (chỉ khi có nợ)
    const spendProgress = min_spend > 0 ? (expense / min_spend) * 100 : 0;
    const isOverBudget = has_debt && expense > min_spend;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">📊 Thống Kê Tháng Này</h2>

            {/* 1. TỔNG QUAN 3 CỘT */}
            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                <div className="p-3 bg-green-50 rounded-xl">
                    <div className="text-green-600 mb-1 flex justify-center"><TrendingUp size={20} /></div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Thu Nhập</p>
                    <p className="font-bold text-green-700 text-sm md:text-base">{formatMoney(income)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                    <div className="text-red-600 mb-1 flex justify-center"><TrendingDown size={20} /></div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Chi Tiêu</p>
                    <p className="font-bold text-red-700 text-sm md:text-base">{formatMoney(expense)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-blue-600 mb-1 flex justify-center"><Wallet size={20} /></div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Còn Lại</p>
                    <p className={`font-bold text-sm md:text-base ${remaining >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                        {formatMoney(remaining)}
                    </p>
                </div>
            </div>

            {/* 2. PIE CHART & BREAKDOWN */}
            <div className="flex items-center gap-6 mb-6">
                {/* Pie Chart Circle */}
                <div className="relative w-24 h-24 rounded-full shrink-0" style={pieStyle}>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">Tỉ trọng</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-gray-600">Thiết yếu</span>
                        </div>
                        <span className="font-semibold text-gray-700">{Math.round(pctMustHave)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="text-gray-600">Hưởng thụ</span>
                        </div>
                        <span className="font-semibold text-gray-700">{Math.round(pctNiceToHave)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                            <span className="text-gray-600">Lãng phí</span>
                        </div>
                        <span className="font-semibold text-gray-700">{Math.round(pctWaste)}%</span>
                    </div>
                </div>
            </div>

            {/* 3. CẢNH BÁO / TIẾN ĐỘ (Chỉ hiện khi CÓ NỢ) */}
            {has_debt && (
                <div className={`p-4 rounded-xl border ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold text-gray-700">Tiến độ chi tiêu (vs Tối thiểu)</span>
                        <span className="text-xs text-gray-500">{formatMoney(expense)} / {formatMoney(min_spend)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-600' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(spendProgress, 100)}%` }}
                        ></div>
                    </div>

                    {isOverBudget && (
                        <div className="flex gap-2 mt-3 text-red-700 text-sm items-start">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <p>Bạn đang nợ và đã chi tiêu vượt mức tối thiểu! Hãy tiết kiệm hơn.</p>
                        </div>
                    )}
                    {!isOverBudget && (
                        <p className="text-xs text-green-600 mt-2 text-right">Bạn đang kiểm soát tốt chi tiêu.</p>
                    )}
                </div>
            )}
        </div>
    )
}
