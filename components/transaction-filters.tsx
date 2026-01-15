"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Calendar } from "lucide-react"

export default function TransactionFilters({ wallets }: { wallets: any[] }) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()

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

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6 space-y-4">
            {/* 1. SEARCH - Full Width Top */}
            <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Search size={16} style={{ color: '#598c58' }} />
                    Tìm kiếm
                </Label>
                <div className="relative">
                    <Input
                        placeholder="Tìm kiếm theo ghi chú..."
                        className="h-11 rounded-xl"
                        defaultValue={searchParams.get("q")?.toString()}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* 2. DATE FILTER */}
            <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Calendar size={16} style={{ color: '#598c58' }} />
                    Khoảng thời gian
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Input
                            type="date"
                            className="h-11 rounded-xl"
                            defaultValue={searchParams.get("from_date")?.toString()}
                            onChange={(e) => handleFilterChange("from_date", e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            type="date"
                            className="h-11 rounded-xl"
                            defaultValue={searchParams.get("to_date")?.toString()}
                            onChange={(e) => handleFilterChange("to_date", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 3. TYPE & WALLET FILTERS */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Loại</Label>
                    <Select
                        defaultValue={searchParams.get("type")?.toString() || "all"}
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
                        defaultValue={searchParams.get("wallet")?.toString() || "all"}
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
                    defaultValue={searchParams.get("sort")?.toString() || "date_desc"}
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
    )
}
