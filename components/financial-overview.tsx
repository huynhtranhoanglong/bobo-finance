"use client"

import { Progress } from "@/components/ui/progress"
import { ShieldCheck, PartyPopper, TrendingUp } from "lucide-react"

export default function FinancialOverview({ metrics }: { metrics: any }) {
    if (!metrics) return null;

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="grid gap-4 md:grid-cols-2 mb-8">

            {/* CARD 1: AN TOÀN TÀI CHÍNH (Dựa trên Min Spending) */}
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">An Toàn Tài Chính</p>
                        <h3 className="text-2xl font-bold mt-1">{formatMoney(metrics.net_worth)}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            / Mục tiêu {formatMoney(metrics.safety_target)}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Tiến độ</span>
                        <span className="font-bold">{metrics.safety_progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.safety_progress} className="h-2 bg-slate-700" />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
                    Chi tiêu tối thiểu: <span className="text-white">{formatMoney(metrics.min_monthly_spend)}/tháng</span>
                </div>
            </div>

            {/* CARD 2: TỰ DO TÀI CHÍNH (Dựa trên Std Spending) */}
            <div className="p-6 bg-white text-black rounded-xl shadow-lg border">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Tự Do Tài Chính</p>
                        <h3 className="text-2xl font-bold mt-1 text-green-600">{formatMoney(metrics.net_worth)}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            / Mục tiêu {formatMoney(metrics.freedom_target)}
                        </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                        <PartyPopper className="h-6 w-6 text-green-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Tiến độ</span>
                        <span className="font-bold">{metrics.freedom_progress.toFixed(1)}%</span>
                    </div>
                    {/* Progress bar màu xanh lá */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(metrics.freedom_progress, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Chi tiêu tiêu chuẩn: <span className="text-black">{formatMoney(metrics.std_monthly_spend)}/tháng</span>
                </div>
            </div>

        </div>
    )
}