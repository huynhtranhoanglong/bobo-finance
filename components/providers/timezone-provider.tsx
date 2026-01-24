"use client";

import { useEffect } from "react";
import { getUserTimezone, setTimezoneCookie } from "@/utils/timezone";

/**
 * TimezoneProvider - Sets timezone cookie on mount
 * Must wrap the app to ensure timezone is available for server components
 */
export function TimezoneProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Get device timezone and save to cookie
        const timezone = getUserTimezone();
        setTimezoneCookie(timezone);
    }, []);

    return <>{children}</>;
}
