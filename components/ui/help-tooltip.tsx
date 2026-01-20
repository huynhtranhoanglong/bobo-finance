"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
 * HelpTooltip - A reusable "?" icon with tooltip
 * 
 * Usage:
 * <HelpTooltip content={t.TOOLTIP_NET_WORTH} />
 * <HelpTooltip content="Custom text" side="right" />
 */
export function HelpTooltip({
    content,
    className,
    size = 14,
    side = "top"
}: HelpTooltipProps) {
    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center justify-center rounded-full",
                        "hover:bg-gray-100 transition-colors p-0.5",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                        className
                    )}
                    style={{ color: COLORS.neutral }}
                    aria-label="Xem giải thích"
                >
                    <HelpCircle size={size} />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side={side}
                className="max-w-xs text-sm leading-relaxed"
            >
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
