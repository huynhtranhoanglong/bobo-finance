/**
 * Utility functions for formatting currency and numbers
 * Supports both Vietnamese (vi-VN) and US English (en-US) locales
 * v1.4.2
 */

export type LocaleType = 'vi' | 'en';

/**
 * Format a number as currency based on locale
 * - Vietnamese: "1.000.000 ₫"
 * - English (US): "$1,000,000"
 */
export function formatCurrency(
    amount: number,
    locale: LocaleType = 'vi',
    options?: { maximumFractionDigits?: number }
): string {
    const safeAmount = Number(amount) || 0;

    if (locale === 'en') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: options?.maximumFractionDigits ?? 0
        }).format(safeAmount / 25000); // Rough VND to USD conversion
    }

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
