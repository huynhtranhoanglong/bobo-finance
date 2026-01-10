"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow-sm border mb-6 sticky top-0 z-10">
            {/* 1. SEARCH INPUT */}
            <div className="col-span-2 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Tìm kiếm giao dịch..."
                    className="pl-9"
                    defaultValue={searchParams.get("q")?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* 2. FILTER WALLET */}
            <Select
                defaultValue={searchParams.get("wallet")?.toString()}
                onValueChange={(val) => handleFilterChange("wallet", val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Tất cả Ví" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả Ví</SelectItem>
                    {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                            {w.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 3. FILTER TYPE */}
            <Select
                defaultValue={searchParams.get("type")?.toString()}
                onValueChange={(val) => handleFilterChange("type", val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Loại Giao Dịch" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả Loại</SelectItem>
                    <SelectItem value="income">Thu nhập (+)</SelectItem>
                    <SelectItem value="expense">Chi tiêu (-)</SelectItem>
                    <SelectItem value="debt_repayment">Trả nợ</SelectItem>
                    <SelectItem value="transfer_out">Chuyển đi</SelectItem>
                    <SelectItem value="transfer_in">Nhận về</SelectItem>
                </SelectContent>
            </Select>

            {/* 4. SORT (Optional addition for full feature) */}
            <Select
                defaultValue={searchParams.get("sort")?.toString() || "date_desc"}
                onValueChange={(val) => handleFilterChange("sort", val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date_desc">Mới nhất</SelectItem>
                    <SelectItem value="date_asc">Cũ nhất</SelectItem>
                    <SelectItem value="amount_desc">Số tiền lớn nhất</SelectItem>
                    <SelectItem value="amount_asc">Số tiền nhỏ nhất</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
