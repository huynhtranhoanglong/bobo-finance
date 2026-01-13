"use client";

import { usePrivacy } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PrivacyToggle() {
    const { isPrivacyMode, togglePrivacy } = usePrivacy();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePrivacy}
                        className="text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        {isPrivacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isPrivacyMode ? "Hiện số dư" : "Ẩn số dư (Riêng tư)"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
