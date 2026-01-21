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
import { Search, Calendar, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { COLOR_BRAND } from "@/utils/colors"
import { useTranslation } from "@/components/providers/language-provider"

interface ActiveEvent {
    id: string;
    name: string;
}

interface TransactionFiltersProps {
    wallets: any[];
    events?: ActiveEvent[];
}

export default function TransactionFilters({ wallets, events = [] }: TransactionFiltersProps) {
    const { t } = useTranslation()
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
        (searchParams.get("event") && searchParams.get("event") !== "all") ||
        (searchParams.get("sort") && searchParams.get("sort") !== "date_desc");

    return (
        <div className="bg-white rounded-2xl shadow-sm border mb-6">
            {/* Header - Always visible */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Search size={20} style={{ color: COLOR_BRAND }} />
                    <span className="font-medium text-gray-700">{t.LABEL_FILTER_SEARCH}</span>
                    {hasActiveFilters && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {t.LABEL_FILTERING}
                        </span>
                    )}
                </div>
                {/* Reset Button (Only visible if expanded or filters active) */}
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                replace("/transactions");
                            }}
                            title={t.LABEL_RESET_FILTER}
                        >
                            <RotateCcw size={16} />
                        </Button>
                    )}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t pt-4">
                    {/* 1. SEARCH - Full Width */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            {t.LABEL_SEARCH_BY_NOTE}
                        </Label>
                        <Input
                            placeholder={t.LABEL_SEARCH_PLACEHOLDER}
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
                            <Calendar size={16} style={{ color: COLOR_BRAND }} />
                            {t.LABEL_DATE_RANGE}
                        </Label>
                        <Select
                            value={searchParams.get("date_preset")?.toString() || "all"}
                            onValueChange={handleDatePresetChange}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder={t.LABEL_DATE_ALL_TIME} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.LABEL_DATE_ALL_TIME}</SelectItem>
                                <SelectItem value="today">{t.LABEL_DATE_TODAY}</SelectItem>
                                <SelectItem value="yesterday">{t.LABEL_DATE_YESTERDAY}</SelectItem>
                                <SelectItem value="last7days">{t.LABEL_DATE_LAST_7_DAYS}</SelectItem>
                                <SelectItem value="thisweek">{t.LABEL_DATE_THIS_WEEK}</SelectItem>
                                <SelectItem value="thismonth">{t.LABEL_DATE_THIS_MONTH}</SelectItem>
                                <SelectItem value="lastmonth">{t.LABEL_DATE_LAST_MONTH}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. TYPE & WALLET FILTERS */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t.LABEL_TYPE}</Label>
                            <Select
                                value={searchParams.get("type")?.toString() || "all"}
                                onValueChange={(val) => handleFilterChange("type", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder={t.LABEL_ALL} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.LABEL_ALL}</SelectItem>
                                    <SelectItem value="income">{t.LABEL_INCOME}</SelectItem>
                                    <SelectItem value="expense">{t.LABEL_EXPENSE}</SelectItem>
                                    <SelectItem value="debt_repayment">{t.LABEL_DEBT_REPAYMENT}</SelectItem>
                                    <SelectItem value="transfer_out">{t.LABEL_TRANSFER_OUT}</SelectItem>
                                    <SelectItem value="transfer_in">{t.LABEL_TRANSFER_IN}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t.LABEL_WALLET}</Label>
                            <Select
                                value={searchParams.get("wallet")?.toString() || "all"}
                                onValueChange={(val) => handleFilterChange("wallet", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder={t.LABEL_ALL} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.LABEL_ALL_WALLETS}</SelectItem>
                                    {wallets.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 4. EVENT FILTER (v1.6.3) */}
                    {events.length > 0 && (
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t.LABEL_EVENT}</Label>
                            <Select
                                value={searchParams.get("event")?.toString() || "all"}
                                onValueChange={(val) => handleFilterChange("event", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder={t.LABEL_ALL} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.LABEL_ALL_EVENTS}</SelectItem>
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={e.id}>
                                            📅 {e.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t" />

                    {/* 4. SORT - Bottom */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">{t.LABEL_SORT}</Label>
                        <Select
                            value={searchParams.get("sort")?.toString() || "date_desc"}
                            onValueChange={(val) => handleFilterChange("sort", val)}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder={t.LABEL_SORT_NEWEST} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date_desc">{t.LABEL_SORT_NEWEST}</SelectItem>
                                <SelectItem value="date_asc">{t.LABEL_SORT_OLDEST}</SelectItem>
                                <SelectItem value="amount_desc">{t.LABEL_SORT_AMOUNT_HIGH}</SelectItem>
                                <SelectItem value="amount_asc">{t.LABEL_SORT_AMOUNT_LOW}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
