"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COLORS } from "@/utils/colors";

interface HelpTooltipProps {
    /** Content to display in tooltip - can be string or React node */
    content: React.ReactNode;
    /** Optional className for the icon button */
    className?: string;
    /** Icon size in pixels (default: 14) */
    size?: number;
    /** Side of the tooltip (default: top) */
    side?: "top" | "right" | "bottom" | "left";
}

/**
 * HelpTooltip - A reusable "?" icon with popover (mobile friendly)
 * 
 * Update v1.5.2: Switched from Tooltip (hover) to Popover (click)
 * to ensure consistent behavior on mobile devices.
 */
export function HelpTooltip({
    content,
    className,
    size = 14,
    side = "top"
}: HelpTooltipProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center justify-center rounded-full",
                        "hover:bg-gray-100 transition-colors p-0.5",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer",
                        className
                    )}
                    style={{ color: COLORS.neutral }}
                    aria-label="Xem giải thích"
                >
                    <HelpCircle size={size} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side={side}
                className="max-w-[280px] text-sm leading-relaxed p-3"
            >
                {content}
            </PopoverContent>
        </Popover>
    );
}
