-- ============================================================
-- PRIVATE WALLET FEATURE (v1.4.0)
-- Date: 2026-01-18
-- Purpose: 
--   1. Update create_wallet_with_initial_balance to accept visibility
--   2. Create get_private_dashboard_data RPC for private wallets page
-- ============================================================

-- ============================================================
-- 1. UPDATE: create_wallet_with_initial_balance
-- Add p_visibility parameter (default 'shared')
-- ============================================================

DROP FUNCTION IF EXISTS create_wallet_with_initial_balance(text, uuid, decimal);
DROP FUNCTION IF EXISTS create_wallet_with_initial_balance(text, uuid, decimal, text);

CREATE OR REPLACE FUNCTION create_wallet_with_initial_balance(
  p_name text,
  p_fund_id uuid,
  p_initial_balance decimal,
  p_visibility text DEFAULT 'shared'
) RETURNS void AS $$
DECLARE
  v_wallet_id uuid;
  v_family_id uuid;
  v_actual_visibility text;
BEGIN
  -- Get user's family_id (or null if not in family)
  v_family_id := get_user_family_id();
  
  -- If user has no family, always use 'shared' (no need for private)
  -- If user has family, use the provided visibility
  IF v_family_id IS NULL THEN
    v_actual_visibility := 'shared';
  ELSE
    v_actual_visibility := p_visibility;
  END IF;
  
  -- Validate visibility value
  IF v_actual_visibility NOT IN ('shared', 'private') THEN
    v_actual_visibility := 'shared';
  END IF;
  
  -- 1. Insert new wallet with visibility
  INSERT INTO wallets (name, fund_id, balance, user_id, family_id, visibility)
  VALUES (p_name, p_fund_id, p_initial_balance, auth.uid(), v_family_id, v_actual_visibility)
  RETURNING id INTO v_wallet_id;

  -- 2. Auto-create initial transaction (if balance != 0)
  IF p_initial_balance > 0 THEN
     -- Positive balance: Treat as initial income
     INSERT INTO transactions (wallet_id, amount, type, category_level, note, date, user_id, family_id)
     VALUES (v_wallet_id, p_initial_balance, 'income', 'other_income', 'Số dư ban đầu', now(), auth.uid(), v_family_id);
     
  ELSIF p_initial_balance < 0 THEN
     -- Negative balance: Treat as initial expense (amount must be positive)
     INSERT INTO transactions (wallet_id, amount, type, category_level, note, date, user_id, family_id)
     VALUES (v_wallet_id, abs(p_initial_balance), 'expense', 'must_have', 'Số dư ban đầu (Âm)', now(), auth.uid(), v_family_id);
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. NEW: get_private_dashboard_data
-- Returns private wallets data for the current user
-- Only returns wallets where visibility = 'private' AND user_id = auth.uid()
-- ============================================================

CREATE OR REPLACE FUNCTION get_private_dashboard_data()
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_total_balance decimal := 0;
  v_wallets jsonb := '[]'::jsonb;
BEGIN
  v_user_id := auth.uid();
  
  -- 1. Get total balance of private wallets
  SELECT COALESCE(SUM(balance), 0) INTO v_total_balance
  FROM wallets
  WHERE user_id = v_user_id AND visibility = 'private';
  
  -- 2. Get list of private wallets with fund info
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', w.id,
      'name', w.name,
      'balance', w.balance,
      'fund_id', w.fund_id,
      'fund_name', f.name,
      'created_at', w.created_at
    ) ORDER BY w.created_at DESC
  ), '[]'::jsonb) INTO v_wallets
  FROM wallets w
  LEFT JOIN funds f ON w.fund_id = f.id
  WHERE w.user_id = v_user_id AND w.visibility = 'private';
  
  -- 3. Return result
  RETURN jsonb_build_object(
    'total_balance', v_total_balance,
    'wallets', v_wallets,
    'wallet_count', jsonb_array_length(v_wallets)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION create_wallet_with_initial_balance(text, uuid, decimal, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_private_dashboard_data() TO authenticated;
