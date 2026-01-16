import { cn } from "@/lib/utils";

interface AppVersionProps {
    className?: string;
    light?: boolean; // For dark backgrounds if needed
}

export function AppVersion({ className, light }: AppVersionProps) {
    // CENTRALIZED VERSION CONTROL
    const VERSION = "v1.3.12-fix";

    return (
        <p className={cn(
            "text-center text-xs mt-8 mb-4",
            light ? "text-white/50" : "text-gray-400",
            className
        )}>
            Build: {VERSION}
        </p>
    );
}
