-- ============================================================
-- FIX RLS INFINITE RECURSION (v1.3.7)
-- Date: 2026-01-16
-- Purpose: Fix empty transaction history due to RLS recursion
-- ============================================================

-- 1. Helper Function: Get Family ID (SECURITY DEFINER)
-- This function runs with higher privileges to bypass RLS recursion
CREATE OR REPLACE FUNCTION get_user_family_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT family_id 
        FROM family_members 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Fix 'family_members' Policy
-- OLD: family_id IN (SELECT family_id FROM family_members ...) -> Causes recursion
-- NEW: family_id = get_user_family_id() -> Breaks recursion

DROP POLICY IF EXISTS "Members can view their family members" ON family_members;

CREATE POLICY "Members can view their family members" ON family_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR family_id = get_user_family_id()
    );


-- 3. Fix 'families' Policy
DROP POLICY IF EXISTS "Users can view their own family" ON families;

CREATE POLICY "Users can view their own family" ON families
    FOR SELECT USING (
        owner_id = auth.uid()
        OR id = get_user_family_id()
    );


-- 4. Fix 'transactions' Policy
DROP POLICY IF EXISTS "Users can view own and family transactions" ON transactions;

CREATE POLICY "Users can view own and family transactions" ON transactions
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id = get_user_family_id()
        )
    );


-- 5. Fix 'wallets' Policy
DROP POLICY IF EXISTS "Users can view own and family wallets" ON wallets;

CREATE POLICY "Users can view own and family wallets" ON wallets
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id = get_user_family_id()
            AND visibility = 'shared'
        )
    );


-- 6. Fix 'debts' Policy
DROP POLICY IF EXISTS "Users can view own and family debts" ON debts;

CREATE POLICY "Users can view own and family debts" ON debts
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id = get_user_family_id()
        )
    );


-- 7. Fix 'funds' Policy
DROP POLICY IF EXISTS "Users can view own and family funds" ON funds;

CREATE POLICY "Users can view own and family funds" ON funds
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id = get_user_family_id()
        )
    );
