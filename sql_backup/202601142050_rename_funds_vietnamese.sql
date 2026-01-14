-- VERSION: v1.1.7
-- DATE: 2026-01-14
-- FEATURE: Rename Funds to Vietnamese + Fix typo

-- 1. Rename funds to Vietnamese
UPDATE funds SET name = 'Tiền mặt' WHERE name = 'Daily Expenses';
UPDATE funds SET name = 'Quỹ dự phòng khẩn cấp' WHERE name = 'Emergency Fund';
UPDATE funds SET name = 'Quỹ kế hoạch' WHERE name = 'Sinking Fund';
UPDATE funds SET name = 'Quỹ đầu tư' WHERE name IN ('Investment Fund', 'Invesment Fund');

-- Note: Run this script manually in Supabase SQL Editor after deployment
