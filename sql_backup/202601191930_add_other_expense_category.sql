-- =====================================================
-- Add 'other_expense' to spending_category enum
-- Version: 1.4.11
-- Date: 2026-01-19
-- =====================================================
-- Purpose:
-- Add a new expense category "Other" for special transactions
-- like currency exchange, adjustments, etc.
--
-- NOTE: This category will NOT be counted in the pie chart breakdown
-- (handled in frontend/backend logic, not SQL)
-- =====================================================

-- 1. Add new enum value
ALTER TYPE spending_category ADD VALUE IF NOT EXISTS 'other_expense';
