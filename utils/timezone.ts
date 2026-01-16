/**
 * Timezone Utility - Centralized timezone handling
 * v1.3.13
 */

import {
    GREETING_MORNING_START,
    GREETING_AFTERNOON_START,
    GREETING_EVENING_START,
    GREETING_NIGHT_START
} from "@/utils/constants";

// Default timezone (fallback)
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Get user's device timezone
 * Only works in browser (Client Component)
 */
export function getUserTimezone(): string {
    if (typeof window === "undefined") {
        return DEFAULT_TIMEZONE;
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone from cookie (for Server Components)
 * Returns default if cookie not set
 */
export function getTimezoneFromCookie(cookieValue: string | undefined): string {
    return cookieValue || DEFAULT_TIMEZONE;
}

/**
 * Set timezone cookie
 * Cookie expires in 1 year
 */
export function setTimezoneCookie(timezone: string): void {
    if (typeof document === "undefined") return;
    document.cookie = `timezone=${timezone}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Get current hour in user's timezone (for greeting)
 */
export function getCurrentHour(): number {
    return new Date().getHours();
}

/**
 * Get greeting based on current hour
 */
export function getTimeBasedGreeting(): { text: string; emoji: string } {
    const hour = getCurrentHour();

    if (hour >= GREETING_MORNING_START && hour < GREETING_AFTERNOON_START) {
        return { text: "Chào buổi sáng", emoji: "☀️" };
    } else if (hour >= GREETING_AFTERNOON_START && hour < GREETING_EVENING_START) {
        return { text: "Chào buổi chiều", emoji: "🌤️" };
    } else if (hour >= GREETING_EVENING_START && hour < GREETING_NIGHT_START) {
        return { text: "Chào buổi tối", emoji: "🌙" };
    } else {
        return { text: "Khuya rồi, nghỉ ngơi nhé", emoji: "🌃" };
    }
}

/**
 * Get date range for common presets
 * All dates calculated based on device timezone
 */
export function getDatePreset(preset: string): { fromDate: string; toDate: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let fromDate: Date;
    let toDate: Date = today;

    const formatDate = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    switch (preset) {
        case 'today':
            fromDate = today;
            break;
        case 'yesterday':
            fromDate = new Date(today);
            fromDate.setDate(fromDate.getDate() - 1);
            toDate = fromDate;
            break;
        case 'last_7_days':
            fromDate = new Date(today);
            fromDate.setDate(fromDate.getDate() - 6);
            break;
        case 'this_week':
            fromDate = new Date(today);
            const dayOfWeek = fromDate.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            fromDate.setDate(fromDate.getDate() - diff);
            break;
        case 'this_month':
            fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'last_month':
            fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            toDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'all':
        default:
            return { fromDate: '', toDate: '' };
    }

    return {
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate)
    };
}
