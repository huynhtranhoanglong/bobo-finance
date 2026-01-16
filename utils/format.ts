/**
 * Utility functions for formatting currency and numbers (Vietnamese locale)
 * Centralized to ensure consistency across the application
 */

/**
 * Format a number as Vietnamese Dong currency (e.g., "1.000.000 ₫")
 */
export function formatCurrency(amount: number, options?: { maximumFractionDigits?: number }): string {
    const safeAmount = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: options?.maximumFractionDigits ?? 0
    }).format(safeAmount);
}

/**
 * Format a number with thousand separators (e.g., "1.000.000")
 * Used for input fields
 */
export function formatNumber(amount: number): string {
    const safeAmount = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(safeAmount);
}

/**
 * Parse a formatted string back to number (e.g., "1.000.000" -> 1000000)
 */
export function parseFormattedNumber(value: string): number {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    return parseInt(numericValue, 10) || 0;
}
