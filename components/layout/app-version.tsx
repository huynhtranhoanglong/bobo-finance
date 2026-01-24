import { cn } from "@/lib/utils";

// CENTRALIZED VERSION CONTROL
export const APP_VERSION = "1.8.7";

interface AppVersionProps {
    className?: string;
    light?: boolean;
}

export function AppVersion({ className, light }: AppVersionProps) {
    return (
        <p className={cn(
            "text-center text-xs mt-8 mb-4 opacity-60 font-mono tracking-wider",
            light ? "text-white/80" : "text-slate-400",
            className
        )}>
            v{APP_VERSION}
        </p>
    );
}
