/**
 * Type definitions for Bobo Finance
 * Centralized types to ensure type-safety across components
 */

// ============ Core Entities ============

export interface Wallet {
    id: string;
    name: string;
    balance: number;
    fund_id: string;
    user_id?: string;
    created_at?: string;
    funds?: Fund;
}

export interface Fund {
    id: string;
    name: string;
    type?: string;
    user_id?: string;
    created_at?: string;
}

export interface Debt {
    id: string;
    name: string;
    total_amount: number;
    remaining_amount: number;
    type: DebtType;
    interest_level?: DebtInterestLevel;
    user_id?: string;
    created_at?: string;
}

export interface Transaction {
    id: string;
    wallet_id: string;
    user_id?: string;
    amount: number;
    type: TransactionType;
    category_level?: SpendingCategory;
    note?: string;
    date: string;
    related_debt_id?: string;
    created_at?: string;
    // Joined relations
    wallets?: { name: string };
    debts?: { name: string };
}

// ============ Enums ============

export type TransactionType =
    | 'income'
    | 'expense'
    | 'transfer_in'
    | 'transfer_out'
    | 'debt_repayment';

export type SpendingCategory =
    | 'must_have'
    | 'nice_to_have'
    | 'waste'
    | 'salary'
    | 'other_income'
    | 'invest';

export type DebtType = 'payable' | 'receivable';

export type DebtInterestLevel = 'none' | 'low' | 'medium' | 'high';

// ============ Dashboard Data ============

export interface FinancialMetrics {
    net_worth: number;
    total_assets: number;
    total_debts: number;
    min_monthly_spend: number;
    std_monthly_spend: number;
    safety_target: number;
    freedom_target: number;
    safety_progress: number;
    freedom_progress: number;
}

export interface MonthlyStatsData {
    income: number;
    expense: number;
    remaining: number;
    breakdown: {
        must_have: number;
        nice_to_have: number;
        waste: number;
    };
    min_spend: number;
    std_spend?: number;
    has_debt: boolean;
}

export interface DashboardData {
    metrics: FinancialMetrics;
    monthly_stats: MonthlyStatsData;
    wallets: Wallet[];
    debts: Debt[];
    funds: Fund[];
}
