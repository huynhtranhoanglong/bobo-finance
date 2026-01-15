"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
            const formatted = new Intl.NumberFormat("vi-VN").format(initialValue)
            setDisplayValue(formatted)
            setRawValue(initialValue.toString())
        }
    }, [initialValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value

        // Remove all non-numeric characters
        const numericValue = input.replace(/\D/g, "")

        if (numericValue === "") {
            setDisplayValue("")
            setRawValue("")
            return
        }

        // Parse as number and format
        const number = parseInt(numericValue, 10)
        const formatted = new Intl.NumberFormat("vi-VN").format(number)

        setDisplayValue(formatted)
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
