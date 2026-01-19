/**
 * Utility functions for formatting currency and numbers
 * Supports both Vietnamese (vi-VN) and US English (en-US) formatting styles
 * Currency is always VND, only the formatting style changes
 * v1.4.3
 */

export type LocaleType = 'vi' | 'en';

/**
 * Format a number as Vietnamese Dong currency
 * - Vietnamese format: "1.000.000 ₫" (symbol after, dot as thousands separator)
 * - English format: "₫1,000,000" (symbol before, comma as thousands separator)
 */
export function formatCurrency(
    amount: number,
    locale: LocaleType = 'vi',
    options?: { maximumFractionDigits?: number }
): string {
    const safeAmount = Number(amount) || 0;

    if (locale === 'en') {
        // US format: ₫ symbol before, comma as thousands separator
        const formatted = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: options?.maximumFractionDigits ?? 0
        }).format(safeAmount);
        return `₫${formatted}`;
    }

    // Vietnamese format: ₫ symbol after, dot as thousands separator
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: options?.maximumFractionDigits ?? 0
    }).format(safeAmount);
}

/**
 * Format a number with thousand separators based on locale
 * - Vietnamese: "1.000.000"
 * - English (US): "1,000,000"
 */
export function formatNumber(amount: number, locale: LocaleType = 'vi'): string {
    const safeAmount = Number(amount) || 0;
    const localeCode = locale === 'en' ? 'en-US' : 'vi-VN';
    return new Intl.NumberFormat(localeCode).format(safeAmount);
}

/**
 * Parse a formatted string back to number (e.g., "1.000.000" or "1,000,000" -> 1000000)
 */
export function parseFormattedNumber(value: string): number {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    return parseInt(numericValue, 10) || 0;
}
