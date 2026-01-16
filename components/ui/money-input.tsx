"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatNumber, parseFormattedNumber } from "@/utils/format"

interface MoneyInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    name: string
    initialValue?: number
    className?: string
}

export function MoneyInput({ name, initialValue, className, ...props }: MoneyInputProps) {
    const [displayValue, setDisplayValue] = React.useState("")
    const [rawValue, setRawValue] = React.useState(initialValue?.toString() || "")

    // Initialize display value on mount or when initialValue changes
    React.useEffect(() => {
        if (initialValue !== undefined && initialValue !== null) {
            setDisplayValue(formatNumber(initialValue))
            setRawValue(initialValue.toString())
        }
    }, [initialValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        const number = parseFormattedNumber(input)

        if (number === 0 && input !== "0") {
            setDisplayValue("")
            setRawValue("")
            return
        }

        setDisplayValue(formatNumber(number))
        setRawValue(number.toString())
    }

    return (
        <div className="relative w-full">
            <Input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                className={cn("font-mono", className)}
                {...props}
            />
            {/* Hidden input to send raw number to form action */}
            <input type="hidden" name={name} value={rawValue} />
        </div>
    )
}
