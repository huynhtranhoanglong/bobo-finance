-- ============================================================
-- UPDATE INCOME CATEGORIES (v1.4.8)
-- Date: 2026-01-19
-- Purpose: Expand income categories from 2 (Salary, Other) to 4 (Main, Bonus, Investment, Other)
-- ============================================================

-- 1. Add new enum values to 'spending_category'
-- Note: 'other_income' and 'salary' (legacy) likely already exist.
-- PostgreSQL requires adding values one by one outside of a transaction block usually, 
-- but Supabase SQL editor often handles it. We'll add 'main_income', 'bonus', 'investment'.

-- ============================================================
-- IMPORTANT: PLEASE RUN THIS SCRIPT IN 2 STEPS (BATCHES)
-- PostgreSQL does not allow using a new ENUM value in the same transaction block where it was created.
-- ============================================================

-- >>> STEP 1: RUN ONLY THESE LINES FIRST (Select lines 10-14 and click Run) <<<
ALTER TYPE spending_category ADD VALUE IF NOT EXISTS 'main_income';
ALTER TYPE spending_category ADD VALUE IF NOT EXISTS 'bonus';
ALTER TYPE spending_category ADD VALUE IF NOT EXISTS 'investment';
-- (After running Step 1, you must see "Success" message)

-- ============================================================

-- >>> STEP 2: RUN ONLY THESE LINES SECOND (Select from here to end and click Run) <<<
-- Convert 'salary' -> 'main_income'
UPDATE transactions
SET category_level = 'main_income'
WHERE category_level = 'salary';

-- We do NOT remove 'salary' from validation as it's an enum, 
-- and removing enum values is complex/unsafe. We just won't use it in UI anymore.
-- 'other_income' is kept as is.
