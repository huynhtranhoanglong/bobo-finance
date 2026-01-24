-- ============================================================
-- FIX TRANSFER FUNCTION OVERLOAD (v1.8.7)
-- Date: 2026-01-25
-- Purpose: Fix family_id = NULL in transfer transactions
-- Root cause: PostgreSQL function overloading - old 5-param version 
--             (without family_id) was being called instead of new 4-param version
-- ============================================================

-- ============ 1. DROP OLD VERSION (5 parameters, no family_id) ============
DROP FUNCTION IF EXISTS transfer_funds(uuid, uuid, numeric, text, timestamptz);

-- ============ 2. DROP 4-PARAM VERSION TO AVOID CONFLICT ============
DROP FUNCTION IF EXISTS transfer_funds(uuid, uuid, numeric, text);

-- ============ 3. CREATE UNIFIED VERSION (5 params with family_id) ============
CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount decimal,
  p_note text,
  p_date timestamptz DEFAULT now()
) RETURNS void AS $$
DECLARE
  v_family_id uuid;
BEGIN
  -- Get user's family_id (returns NULL if user is not in any family)
  v_family_id := get_user_family_id();
  
  -- 1. Subtract from source wallet
  UPDATE wallets SET balance = balance - p_amount WHERE id = p_from_wallet_id;

  -- 2. Add to destination wallet
  UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;

  -- 3. Create 2 transactions (transfer_out and transfer_in) with family_id
  INSERT INTO transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  VALUES (auth.uid(), p_from_wallet_id, p_amount, 'transfer_out', 'must_have', p_note, p_date, v_family_id);

  INSERT INTO transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  VALUES (auth.uid(), p_to_wallet_id, p_amount, 'transfer_in', 'must_have', p_note, p_date, v_family_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ 4. BACKFILL: Update existing transfers missing family_id ============
DO $$
DECLARE
    v_count INT;
BEGIN
    WITH updated_rows AS (
        UPDATE transactions t
        SET family_id = fm.family_id
        FROM family_members fm
        WHERE t.user_id = fm.user_id 
          AND t.family_id IS NULL
          AND t.type IN ('transfer_in', 'transfer_out')
        RETURNING t.id
    )
    SELECT count(*) INTO v_count FROM updated_rows;

    RAISE NOTICE 'Backfilled % transfer transactions with missing family_id', v_count;
END $$;

-- ============ 5. VERIFY: Check no more NULL family_id for family users ============
-- Run this query after script to verify:
-- SELECT t.id, t.type, t.family_id, fm.family_id as expected_family_id
-- FROM transactions t
-- JOIN family_members fm ON t.user_id = fm.user_id
-- WHERE t.type IN ('transfer_in', 'transfer_out') AND t.family_id IS NULL;
-- Expected result: 0 rows
