"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Calendar, ChevronDown, ChevronUp } from "lucide-react"

export default function TransactionFilters({ wallets }: { wallets: any[] }) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }
        replace(`/transactions?${params.toString()}`)
    }, 500)

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        replace(`/transactions?${params.toString()}`)
    }

    // Handle preset date range selection - FIX v1.2.6 (Local Time)
    const handleDatePresetChange = (preset: string) => {
        const params = new URLSearchParams(searchParams)
        const now = new Date()
        let fromDate: Date | null = null
        let toDate: Date | null = null

        // Helper to format date as YYYY-MM-DD in LOCAL TIME
        const formatDateLocal = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        switch (preset) {
            case 'today':
                fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                break
            case 'yesterday':
                const yesterday = new Date(now)
                yesterday.setDate(yesterday.getDate() - 1)
                fromDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
                toDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
                break
            case 'last7days':
                fromDate = new Date(now)
                fromDate.setDate(fromDate.getDate() - 7)
                toDate = now
                break
            case 'thisweek':
                const dayOfWeek = now.getDay()
                const monday = new Date(now)
                monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
                fromDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate())
                toDate = now
                break
            case 'thismonth':
                fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
                toDate = now
                break
            case 'lastmonth':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
                fromDate = lastMonth
                toDate = lastDayOfLastMonth
                break
            case 'all':
            default:
                params.delete('from_date')
                params.delete('to_date')
                params.delete('date_preset')
                replace(`/transactions?${params.toString()}`)
                return
        }

        if (fromDate && toDate) {
            // FIX: Use manual formatting to preserve Local Date
            params.set('from_date', formatDateLocal(fromDate))
            params.set('to_date', formatDateLocal(toDate))
            params.set('date_preset', preset)
        }

        replace(`/transactions?${params.toString()}`)
    }

    // Check if any filters are active
    const hasActiveFilters = searchParams.get("from_date") || searchParams.get("to_date") ||
        (searchParams.get("type") && searchParams.get("type") !== "all") ||
        (searchParams.get("wallet") && searchParams.get("wallet") !== "all") ||
        (searchParams.get("sort") && searchParams.get("sort") !== "date_desc");

    return (
        <div className="bg-white rounded-2xl shadow-sm border mb-6">
            {/* Header - Always visible */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Search size={20} style={{ color: '#598c58' }} />
                    <span className="font-medium text-gray-700">Bộ lọc & Tìm kiếm</span>
                    {hasActiveFilters && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Đang lọc
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t pt-4">
                    {/* 1. SEARCH - Full Width */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Tìm kiếm theo ghi chú
                        </Label>
                        <Input
                            placeholder="Nhập từ khóa..."
                            className="h-11 rounded-xl"
                            defaultValue={searchParams.get("q")?.toString()}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* 2. DATE PRESET FILTER */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                            <Calendar size={16} style={{ color: '#598c58' }} />
                            Khoảng thời gian
                        </Label>
                        <Select
                            value={searchParams.get("date_preset")?.toString() || "all"}
                            onValueChange={handleDatePresetChange}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Toàn thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toàn thời gian</SelectItem>
                                <SelectItem value="today">Hôm nay</SelectItem>
                                <SelectItem value="yesterday">Hôm qua</SelectItem>
                                <SelectItem value="last7days">7 ngày qua</SelectItem>
                                <SelectItem value="thisweek">Tuần này</SelectItem>
                                <SelectItem value="thismonth">Tháng này</SelectItem>
                                <SelectItem value="lastmonth">Tháng trước</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. TYPE & WALLET FILTERS */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Loại</Label>
                            <Select
                                value={searchParams.get("type")?.toString() || "all"}
                                onValueChange={(val) => handleFilterChange("type", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="income">Thu nhập</SelectItem>
                                    <SelectItem value="expense">Chi tiêu</SelectItem>
                                    <SelectItem value="debt_repayment">Trả nợ</SelectItem>
                                    <SelectItem value="transfer_out">Chuyển đi</SelectItem>
                                    <SelectItem value="transfer_in">Nhận về</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Ví</Label>
                            <Select
                                value={searchParams.get("wallet")?.toString() || "all"}
                                onValueChange={(val) => handleFilterChange("wallet", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả ví</SelectItem>
                                    {wallets.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* 4. SORT - Bottom */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Sắp xếp</Label>
                        <Select
                            value={searchParams.get("sort")?.toString() || "date_desc"}
                            onValueChange={(val) => handleFilterChange("sort", val)}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Mới nhất" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date_desc">Mới nhất</SelectItem>
                                <SelectItem value="date_asc">Cũ nhất</SelectItem>
                                <SelectItem value="amount_desc">Số tiền lớn nhất</SelectItem>
                                <SelectItem value="amount_asc">Số tiền nhỏ nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
