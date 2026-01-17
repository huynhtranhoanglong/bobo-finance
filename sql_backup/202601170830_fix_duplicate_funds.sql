-- ============================================================
-- FIX DUPLICATE FUNDS IN DROPDOWN (v1.3.18)
-- Date: 2026-01-17
-- Purpose: Fix duplicate funds showing in Create Wallet dialog
--          when user belongs to a family with multiple members
-- 
-- Issue: Each family member has their own set of 4 default funds,
--        resulting in duplicates when querying by family_id
-- 
-- Solution: Use DISTINCT ON (name) to return only unique fund names
-- ============================================================

-- Drop existing function(s) to avoid conflicts
DROP FUNCTION IF EXISTS get_dashboard_data(int, int, text);
DROP FUNCTION IF EXISTS get_dashboard_data(int, int);

-- Recreate with DISTINCT ON fix for funds
CREATE OR REPLACE FUNCTION get_dashboard_data(p_month int, p_year int, p_timezone text DEFAULT 'Asia/Ho_Chi_Minh')
RETURNS json AS $$
DECLARE
    -- Context
    v_user_id uuid;
    v_family_id uuid;
    
    -- Metrics (90 days)
    v_min_spend decimal := 0;
    v_std_spend decimal := 0;
    v_total_assets decimal := 0;
    v_total_payable_debts decimal := 0;
    v_total_receivable_debts decimal := 0;
    v_net_worth decimal := 0;
    
    -- Targets
    v_safety_target decimal;
    v_freedom_target decimal;
    
    -- Monthly Stats
    v_start_date timestamptz;
    v_end_date timestamptz;
    v_income decimal := 0;
    v_expense decimal := 0;
    v_must_have decimal := 0;
    v_nice_to_have decimal := 0;
    v_waste decimal := 0;
    v_has_debt boolean := false;
    
    -- Lists
    v_wallets json;
    v_debts json;
    v_funds json;
    v_family_info json;
BEGIN
    -- 1. Setup Context
    v_user_id := auth.uid();
    v_family_id := get_user_family_id();
    
    -- 2. Financial Metrics (Single Pass Query)
    WITH metrics_agg AS (
        SELECT 
            SUM(CASE WHEN category_level = 'must_have' THEN amount ELSE 0 END) as must_have_sum,
            SUM(CASE WHEN category_level IN ('must_have', 'nice_to_have') THEN amount ELSE 0 END) as std_sum
        FROM transactions
        WHERE type = 'expense'
        AND date > (now() - interval '90 days')
        AND (
            (v_family_id IS NOT NULL AND family_id = v_family_id) OR
            (v_family_id IS NULL AND user_id = v_user_id)
        )
    )
    SELECT 
        COALESCE(must_have_sum, 0) / 3,
        COALESCE(std_sum, 0) / 3
    INTO v_min_spend, v_std_spend
    FROM metrics_agg;

    -- Calculate Assets (Wallets)
    SELECT COALESCE(SUM(balance), 0) INTO v_total_assets 
    FROM wallets
    WHERE (
        (v_family_id IS NOT NULL AND family_id = v_family_id AND visibility = 'shared') OR
        (v_family_id IS NULL AND user_id = v_user_id)
    );

    -- Calculate Payable Debts
    SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_payable_debts
    FROM debts
    WHERE type = 'payable' AND remaining_amount > 0 AND (
        (v_family_id IS NOT NULL AND family_id = v_family_id) OR
        (v_family_id IS NULL AND user_id = v_user_id)
    );

    -- Calculate Receivable Debts (v1.3.12)
    SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_receivable_debts
    FROM debts
    WHERE type = 'receivable' AND remaining_amount > 0 AND (
        (v_family_id IS NOT NULL AND family_id = v_family_id) OR
        (v_family_id IS NULL AND user_id = v_user_id)
    );

    -- Calculate Net Worth: Assets - Payable + Receivable
    v_net_worth := v_total_assets - v_total_payable_debts + v_total_receivable_debts;
    
    IF v_min_spend = 0 THEN v_min_spend := 1; END IF;
    IF v_std_spend = 0 THEN v_std_spend := 1; END IF;
    v_safety_target := v_min_spend * 12 * 25;
    v_freedom_target := v_std_spend * 12 * 25;

    -- 3. Monthly Stats (v1.3.13: Using user's timezone from cookie)
    v_start_date := make_timestamptz(p_year, p_month, 1, 0, 0, 0, p_timezone);
    v_end_date := v_start_date + interval '1 month';

    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'must_have' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'nice_to_have' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' AND category_level = 'waste' THEN amount ELSE 0 END), 0)
    INTO v_income, v_expense, v_must_have, v_nice_to_have, v_waste
    FROM transactions
    WHERE date >= v_start_date AND date < v_end_date
    AND (
        (v_family_id IS NOT NULL AND family_id = v_family_id) OR
        (v_family_id IS NULL AND user_id = v_user_id)
    );

    -- Check debt existence
    IF v_total_payable_debts > 0 THEN v_has_debt := true; END IF;

    -- 4. Get Lists
    -- Wallets
    SELECT json_agg(row_to_json(w)) INTO v_wallets FROM (
        SELECT w.id, w.name, w.balance, w.fund_id, w.user_id,
               json_build_object('id', f.id, 'name', f.name) as funds,
               COALESCE(p.display_name, u.email) as owner_name
        FROM wallets w
        LEFT JOIN funds f ON w.fund_id = f.id
        LEFT JOIN auth.users u ON w.user_id = u.id
        LEFT JOIN profiles p ON p.id = w.user_id
        WHERE (
            (v_family_id IS NOT NULL AND w.family_id = v_family_id AND w.visibility = 'shared') OR
            (v_family_id IS NULL AND w.user_id = v_user_id)
        )
        ORDER BY w.balance DESC
    ) w;

    -- Debts
    SELECT json_agg(row_to_json(d)) INTO v_debts FROM (
        SELECT d.id, d.name, d.remaining_amount, d.total_amount, d.type, d.interest_level, d.user_id,
               COALESCE(p.display_name, u.email) as owner_name
        FROM debts d
        LEFT JOIN auth.users u ON d.user_id = u.id
        LEFT JOIN profiles p ON p.id = d.user_id
        WHERE d.remaining_amount > 0 AND (
            (v_family_id IS NOT NULL AND d.family_id = v_family_id) OR
            (v_family_id IS NULL AND d.user_id = v_user_id)
        )
        ORDER BY 
            CASE WHEN d.type = 'payable' THEN 1 ELSE 2 END,
            CASE WHEN d.type = 'payable' THEN 
                CASE d.interest_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END
            ELSE 0 END,
            CASE WHEN d.type = 'payable' THEN d.remaining_amount ELSE NULL END ASC,
            CASE WHEN d.type = 'receivable' THEN d.remaining_amount ELSE NULL END DESC
    ) d;

    -- Funds (v1.3.18: Use DISTINCT ON to remove duplicates in family mode)
    SELECT json_agg(row_to_json(f)) INTO v_funds FROM (
        SELECT DISTINCT ON (name) id, name FROM funds WHERE (
            (v_family_id IS NOT NULL AND family_id = v_family_id) OR
            (v_family_id IS NULL AND user_id = v_user_id)
        )
        ORDER BY name
    ) f;

    -- Family Info
    IF v_family_id IS NOT NULL THEN
        SELECT json_build_object('id', f.id, 'name', f.name, 'is_owner', (f.owner_id = v_user_id),
            'member_count', (SELECT count(*) FROM family_members WHERE family_id = f.id))
        INTO v_family_info FROM families f WHERE f.id = v_family_id;
    END IF;

    -- 5. Return Result
    RETURN json_build_object(
        'metrics', json_build_object(
            'net_worth', v_net_worth, 
            'total_assets', v_total_assets, 
            'total_debts', v_total_payable_debts,
            'total_receivable', v_total_receivable_debts,
            'min_monthly_spend', v_min_spend, 
            'std_monthly_spend', v_std_spend,
            'safety_target', v_safety_target, 
            'freedom_target', v_freedom_target,
            'safety_progress', CASE WHEN v_safety_target > 0 THEN (v_net_worth / v_safety_target) * 100 ELSE 0 END,
            'freedom_progress', CASE WHEN v_freedom_target > 0 THEN (v_net_worth / v_freedom_target) * 100 ELSE 0 END
        ),
        'monthly_stats', json_build_object(
            'income', v_income, 'expense', v_expense, 'remaining', v_income - v_expense,
            'breakdown', json_build_object('must_have', v_must_have, 'nice_to_have', v_nice_to_have, 'waste', v_waste),
            'min_spend', v_min_spend, 'std_spend', v_std_spend, 'has_debt', v_has_debt
        ),
        'wallets', COALESCE(v_wallets, '[]'::json),
        'debts', COALESCE(v_debts, '[]'::json),
        'funds', COALESCE(v_funds, '[]'::json),
        'family', v_family_info
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
