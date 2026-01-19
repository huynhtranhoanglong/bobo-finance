"use client";

import { usePrivacy } from "@/components/providers/privacy-provider";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/components/providers/language-provider";

export function PrivacyToggle() {
    const { isPrivacyMode, togglePrivacy } = usePrivacy();
    const { t } = useTranslation();

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
                    <p>{isPrivacyMode ? t.LABEL_SHOW_BALANCE : t.LABEL_HIDE_BALANCE}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
