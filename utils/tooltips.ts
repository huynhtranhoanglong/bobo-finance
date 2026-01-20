/**
 * Tooltip Keys Configuration
 * v1.5.1
 * 
 * Centralized tooltip key management for easy maintenance.
 * Actual content is stored in i18n translation files (vi.ts, en.ts)
 */

import type { TranslationKeys } from "@/utils/i18n/vi";

/**
 * All tooltip keys used in the application
 * These keys map to translations in vi.ts and en.ts
 */
export const TOOLTIP_KEYS = {
    /** Net Worth explanation */
    NET_WORTH: 'TOOLTIP_NET_WORTH' as TranslationKeys,

    /** Minimum monthly spending */
    MIN_MONTHLY_SPEND: 'TOOLTIP_MIN_MONTHLY_SPEND' as TranslationKeys,

    /** Standard monthly spending */
    STD_MONTHLY_SPEND: 'TOOLTIP_STD_MONTHLY_SPEND' as TranslationKeys,

    /** Financial safety target */
    SAFETY_TARGET: 'TOOLTIP_SAFETY_TARGET' as TranslationKeys,

    /** Financial freedom target */
    FREEDOM_TARGET: 'TOOLTIP_FREEDOM_TARGET' as TranslationKeys,

    /** Spending progress comparison */
    SPENDING_PROGRESS: 'TOOLTIP_SPENDING_PROGRESS' as TranslationKeys,

    /** Expense categories explanation */
    EXPENSE_CATEGORIES: 'TOOLTIP_EXPENSE_CATEGORIES' as TranslationKeys,

    /** Emergency fund months */
    EMERGENCY_MONTHS: 'TOOLTIP_EMERGENCY_MONTHS' as TranslationKeys,

    /** Debt repayment priority */
    DEBT_PRIORITY: 'TOOLTIP_DEBT_PRIORITY' as TranslationKeys,
} as const;

export type TooltipKey = typeof TOOLTIP_KEYS[keyof typeof TOOLTIP_KEYS];
