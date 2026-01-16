-- ============================================================
-- ACCOUNT MANAGEMENT FEATURE (v1.3.6)
-- Date: 2026-01-16
-- Purpose: Update profiles table and add RPCs for account management
-- ============================================================

-- ============ 1. UPDATE PROFILES TABLE ============

-- Add display_name and avatar_url if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Update RLS policies to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Permit insert if not exists (for older users who might not have a profile row)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- ============ 2. RPC FUNCTIONS ============

-- 2.1 Get Profile (with fallback to email if display_name is null)
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS JSON AS $$
DECLARE
    v_profile JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'email', u.email,
        'display_name', COALESCE(p.display_name, u.email), -- Fallback to email
        'avatar_url', p.avatar_url,
        'created_at', p.created_at
    ) INTO v_profile
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE u.id = auth.uid();

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.2 Update Profile
CREATE OR REPLACE FUNCTION update_profile(
    p_display_name TEXT,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Upsert profile (Insert if not exists, Update if exists)
    INSERT INTO profiles (id, display_name, avatar_url, updated_at)
    VALUES (auth.uid(), p_display_name, p_avatar_url, NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
        display_name = EXCLUDED.display_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url), -- Keep old avatar if new is null
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============ 3. UPDATE RELATED RPCs TO USE DISPLAY_NAME ============

-- 3.1 Update get_my_family to use profile display_name
CREATE OR REPLACE FUNCTION get_my_family()
RETURNS JSON AS $$
DECLARE
    v_family_id UUID;
    v_result JSON;
BEGIN
    SELECT family_id INTO v_family_id
    FROM family_members WHERE user_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT json_build_object(
        'id', f.id,
        'name', f.name,
        'owner_id', f.owner_id,
        'created_at', f.created_at,
        'is_owner', (f.owner_id = auth.uid()),
        'members', (
            SELECT json_agg(json_build_object(
                'user_id', fm.user_id,
                'role', fm.role,
                'joined_at', fm.joined_at,
                'email', u.email,
                'display_name', COALESCE(p.display_name, u.email) -- Use Profile Display Name
            ))
            FROM family_members fm
            LEFT JOIN auth.users u ON u.id = fm.user_id
            LEFT JOIN profiles p ON p.id = fm.user_id
            WHERE fm.family_id = f.id
        ),
        'pending_invitations', (
            SELECT json_agg(json_build_object(
                'id', fi.id,
                'email', fi.email,
                'created_at', fi.created_at,
                'expires_at', fi.expires_at
            ))
            FROM family_invitations fi
            WHERE fi.family_id = f.id AND fi.status = 'pending'
        )
    ) INTO v_result
    FROM families f
    WHERE f.id = v_family_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 Update get_dashboard_data to use profile display_name for Wallet Owners & Debt Owners
CREATE OR REPLACE FUNCTION get_dashboard_data(p_month int, p_year int)
RETURNS json AS $$
DECLARE
    v_family_id uuid;
    v_min_spend decimal;
    v_std_spend decimal;
    v_total_assets decimal;
    v_total_debts decimal;
    v_net_worth decimal;
    v_safety_target decimal;
    v_freedom_target decimal;
    v_income decimal := 0;
    v_expense decimal := 0;
    v_must_have decimal := 0;
    v_nice_to_have decimal := 0;
    v_waste decimal := 0;
    v_has_debt boolean := false;
    v_start_date timestamptz;
    v_end_date timestamptz;
    v_wallets json;
    v_debts json;
    v_funds json;
    v_family_info json;
BEGIN
    v_family_id := get_user_family_id();

    -- (metrics calculation skipped for brevity - same as before)
    -- ... [METRICS CALCULATION BLOCK] ... 
    -- RE-INSERTING METRICS LOGIC TO BE SAFE
    IF v_family_id IS NOT NULL THEN
        SELECT COALESCE(SUM(amount), 0) / 3 INTO v_min_spend FROM transactions WHERE type = 'expense' AND category_level = 'must_have' AND date > (now() - interval '90 days') AND family_id = v_family_id;
        SELECT COALESCE(SUM(amount), 0) / 3 INTO v_std_spend FROM transactions WHERE type = 'expense' AND category_level IN ('must_have', 'nice_to_have') AND date > (now() - interval '90 days') AND family_id = v_family_id;
        SELECT COALESCE(SUM(balance), 0) INTO v_total_assets FROM wallets WHERE family_id = v_family_id AND (visibility = 'shared' OR visibility IS NULL);
        SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_debts FROM debts WHERE type = 'payable' AND remaining_amount > 0 AND family_id = v_family_id;
    ELSE
        SELECT COALESCE(SUM(amount), 0) / 3 INTO v_min_spend FROM transactions WHERE type = 'expense' AND category_level = 'must_have' AND date > (now() - interval '90 days') AND user_id = auth.uid();
        SELECT COALESCE(SUM(amount), 0) / 3 INTO v_std_spend FROM transactions WHERE type = 'expense' AND category_level IN ('must_have', 'nice_to_have') AND date > (now() - interval '90 days') AND user_id = auth.uid();
        SELECT COALESCE(SUM(balance), 0) INTO v_total_assets FROM wallets WHERE user_id = auth.uid();
        SELECT COALESCE(SUM(remaining_amount), 0) INTO v_total_debts FROM debts WHERE type = 'payable' AND remaining_amount > 0 AND user_id = auth.uid();
    END IF;

    v_net_worth := v_total_assets - v_total_debts;
    IF v_min_spend = 0 THEN v_min_spend := 1; END IF;
    IF v_std_spend = 0 THEN v_std_spend := 1; END IF;
    v_safety_target := v_min_spend * 12 * 25;
    v_freedom_target := v_std_spend * 12 * 25;

    -- Monthly stats
    v_start_date := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'Asia/Ho_Chi_Minh');
    v_end_date := v_start_date + interval '1 month';

    IF v_family_id IS NOT NULL THEN
        SELECT COALESCE(SUM(amount), 0) INTO v_income FROM transactions WHERE type = 'income' AND date >= v_start_date AND date < v_end_date AND family_id = v_family_id;
        SELECT COALESCE(SUM(amount), 0) INTO v_expense FROM transactions WHERE type = 'expense' AND date >= v_start_date AND date < v_end_date AND family_id = v_family_id;
        SELECT COALESCE(SUM(amount), 0) INTO v_must_have FROM transactions WHERE type = 'expense' AND category_level = 'must_have' AND date >= v_start_date AND date < v_end_date AND family_id = v_family_id;
        SELECT COALESCE(SUM(amount), 0) INTO v_nice_to_have FROM transactions WHERE type = 'expense' AND category_level = 'nice_to_have' AND date >= v_start_date AND date < v_end_date AND family_id = v_family_id;
        SELECT COALESCE(SUM(amount), 0) INTO v_waste FROM transactions WHERE type = 'expense' AND category_level = 'waste' AND date >= v_start_date AND date < v_end_date AND family_id = v_family_id;
        IF EXISTS (SELECT 1 FROM debts WHERE type = 'payable' AND remaining_amount > 0 AND family_id = v_family_id) THEN v_has_debt := true; END IF;
    ELSE
        SELECT COALESCE(SUM(amount), 0) INTO v_income FROM transactions WHERE type = 'income' AND date >= v_start_date AND date < v_end_date AND user_id = auth.uid();
        SELECT COALESCE(SUM(amount), 0) INTO v_expense FROM transactions WHERE type = 'expense' AND date >= v_start_date AND date < v_end_date AND user_id = auth.uid();
        SELECT COALESCE(SUM(amount), 0) INTO v_must_have FROM transactions WHERE type = 'expense' AND category_level = 'must_have' AND date >= v_start_date AND date < v_end_date AND user_id = auth.uid();
        SELECT COALESCE(SUM(amount), 0) INTO v_nice_to_have FROM transactions WHERE type = 'expense' AND category_level = 'nice_to_have' AND date >= v_start_date AND date < v_end_date AND user_id = auth.uid();
        SELECT COALESCE(SUM(amount), 0) INTO v_waste FROM transactions WHERE type = 'expense' AND category_level = 'waste' AND date >= v_start_date AND date < v_end_date AND user_id = auth.uid();
        IF EXISTS (SELECT 1 FROM debts WHERE type = 'payable' AND remaining_amount > 0 AND user_id = auth.uid()) THEN v_has_debt := true; END IF;
    END IF;

    -- Wallets (Use Profile Display Name)
    IF v_family_id IS NOT NULL THEN
        SELECT json_agg(row_to_json(w)) INTO v_wallets FROM (
            SELECT w.id, w.name, w.balance, w.fund_id, w.user_id,
                json_build_object('id', f.id, 'name', f.name) as funds,
                COALESCE(p.display_name, u.email) as owner_name -- Use Profile Name
            FROM wallets w
            LEFT JOIN funds f ON w.fund_id = f.id
            LEFT JOIN auth.users u ON w.user_id = u.id
            LEFT JOIN profiles p ON p.id = w.user_id -- Join Profiles
            WHERE w.family_id = v_family_id AND (w.visibility = 'shared' OR w.visibility IS NULL)
            ORDER BY w.balance DESC
        ) w;
    ELSE
        SELECT json_agg(row_to_json(w)) INTO v_wallets FROM (
            SELECT w.id, w.name, w.balance, w.fund_id,
                json_build_object('id', f.id, 'name', f.name) as funds
            FROM wallets w
            LEFT JOIN funds f ON w.fund_id = f.id
            WHERE w.user_id = auth.uid()
            ORDER BY w.balance DESC
        ) w;
    END IF;

    -- Debts (Use Profile Display Name)
    IF v_family_id IS NOT NULL THEN
        SELECT json_agg(row_to_json(d)) INTO v_debts FROM (
            SELECT d.id, d.name, d.remaining_amount, d.total_amount, d.type, d.interest_level, d.user_id,
                COALESCE(p.display_name, u.email) as owner_name -- Use Profile Name
            FROM debts d
            LEFT JOIN auth.users u ON d.user_id = u.id
            LEFT JOIN profiles p ON p.id = d.user_id -- Join Profiles
            WHERE d.remaining_amount > 0 AND d.family_id = v_family_id
            ORDER BY 
                CASE WHEN d.type = 'payable' THEN 1 ELSE 2 END,
                CASE WHEN d.type = 'payable' THEN 
                    CASE d.interest_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END
                ELSE 0 END,
                CASE WHEN d.type = 'payable' THEN d.remaining_amount ELSE NULL END ASC,
                CASE WHEN d.type = 'receivable' THEN d.remaining_amount ELSE NULL END DESC
        ) d;
    ELSE
        SELECT json_agg(row_to_json(d)) INTO v_debts FROM (
            SELECT id, name, remaining_amount, total_amount, type, interest_level
            FROM debts WHERE remaining_amount > 0 AND user_id = auth.uid()
            ORDER BY 
                CASE WHEN type = 'payable' THEN 1 ELSE 2 END,
                CASE WHEN type = 'payable' THEN 
                    CASE interest_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END
                ELSE 0 END,
                CASE WHEN type = 'payable' THEN remaining_amount ELSE NULL END ASC,
                CASE WHEN type = 'receivable' THEN remaining_amount ELSE NULL END DESC
        ) d;
    END IF;

    -- Funds
    IF v_family_id IS NOT NULL THEN
        SELECT json_agg(row_to_json(f)) INTO v_funds FROM (SELECT id, name FROM funds WHERE family_id = v_family_id) f;
    ELSE
        SELECT json_agg(row_to_json(f)) INTO v_funds FROM (SELECT id, name FROM funds WHERE user_id = auth.uid()) f;
    END IF;

    -- Family info
    IF v_family_id IS NOT NULL THEN
        SELECT json_build_object('id', f.id, 'name', f.name, 'is_owner', (f.owner_id = auth.uid()),
            'member_count', (SELECT count(*) FROM family_members WHERE family_id = f.id))
        INTO v_family_info FROM families f WHERE f.id = v_family_id;
    ELSE
        v_family_info := NULL;
    END IF;

    RETURN json_build_object(
        'metrics', json_build_object(
            'net_worth', v_net_worth, 'total_assets', v_total_assets, 'total_debts', v_total_debts,
            'min_monthly_spend', v_min_spend, 'std_monthly_spend', v_std_spend,
            'safety_target', v_safety_target, 'freedom_target', v_freedom_target,
            'safety_progress', (v_net_worth / v_safety_target) * 100,
            'freedom_progress', (v_net_worth / v_freedom_target) * 100
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
