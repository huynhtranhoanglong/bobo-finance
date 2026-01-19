/**
 * Expense & Income Categories Configuration
 * v1.4.11
 * 
 * Centralized category management for easy maintenance.
 * Used by: add-transaction-dialog, edit-transaction-dialog, monthly-stats
 */

import type { TranslationKeys } from "@/utils/i18n/vi";

// === EXPENSE CATEGORIES ===
export interface ExpenseCategory {
    key: string;
    labelKey: TranslationKeys;
    countInChart: boolean;  // Whether to count in pie chart breakdown
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    { key: 'must_have', labelKey: 'LABEL_CATEGORY_MUST_HAVE', countInChart: true },
    { key: 'nice_to_have', labelKey: 'LABEL_CATEGORY_NICE_TO_HAVE', countInChart: true },
    { key: 'waste', labelKey: 'LABEL_CATEGORY_WASTE', countInChart: true },
    { key: 'other_expense', labelKey: 'LABEL_CATEGORY_OTHER_EXPENSE', countInChart: false },
];

// === INCOME CATEGORIES ===
export interface IncomeCategory {
    key: string;
    labelKey: TranslationKeys;
}

export const INCOME_CATEGORIES: IncomeCategory[] = [
    { key: 'main_income', labelKey: 'LABEL_INCOME_MAIN' },
    { key: 'bonus', labelKey: 'LABEL_INCOME_BONUS' },
    { key: 'investment', labelKey: 'LABEL_INCOME_INVESTMENT' },
    { key: 'other_income', labelKey: 'LABEL_INCOME_OTHER' },
];

// === HELPER FUNCTIONS ===

/**
 * Get expense categories that should be counted in the pie chart
 */
export function getChartableExpenseCategories(): ExpenseCategory[] {
    return EXPENSE_CATEGORIES.filter(c => c.countInChart);
}

/**
 * Get all expense category keys
 */
export function getExpenseCategoryKeys(): string[] {
    return EXPENSE_CATEGORIES.map(c => c.key);
}

/**
 * Get all income category keys
 */
export function getIncomeCategoryKeys(): string[] {
    return INCOME_CATEGORIES.map(c => c.key);
}
