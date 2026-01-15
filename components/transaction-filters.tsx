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
import { Search, Calendar, ChevronDown, ChevronUp, X } from "lucide-react"

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

    const handleClearDate = (key: string) => {
        const params = new URLSearchParams(searchParams)
        params.delete(key)
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

                    {/* 2. DATE FILTER - Stacked Vertically */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                            <Calendar size={16} style={{ color: '#598c58' }} />
                            Khoảng thời gian
                        </Label>
                        <div className="space-y-2">
                            {/* From Date */}
                            <div className="relative">
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl pr-10"
                                    value={searchParams.get("from_date")?.toString() || ""}
                                    onChange={(e) => handleFilterChange("from_date", e.target.value)}
                                    placeholder="Từ ngày"
                                />
                                {searchParams.get("from_date") && (
                                    <button
                                        onClick={() => handleClearDate("from_date")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        type="button"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            {/* To Date */}
                            <div className="relative">
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl pr-10"
                                    value={searchParams.get("to_date")?.toString() || ""}
                                    onChange={(e) => handleFilterChange("to_date", e.target.value)}
                                    placeholder="Đến ngày"
                                />
                                {searchParams.get("to_date") && (
                                    <button
                                        onClick={() => handleClearDate("to_date")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        type="button"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
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
