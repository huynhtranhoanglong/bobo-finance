-- ============================================================
-- FIX TRANSFER FAMILY ID LOGIC (v1.6.6)
-- Date: 2026-01-24
-- Purpose: Re-deploy transfer_funds RPC and backfill missing family_id
-- ============================================================

-- ============ 1. RE-DEPLOY TRANSFER FUNDS RPC ============
-- Ensure the latest logic with family_id is applied

CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount decimal,
  p_note text
) RETURNS void AS $$
DECLARE
  v_family_id uuid;
BEGIN
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- 1. Trừ tiền từ ví nguồn
  UPDATE wallets SET balance = balance - p_amount WHERE id = p_from_wallet_id;

  -- 2. Cộng tiền vào ví đích
  UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;

  -- 3. Tạo 2 transaction (1 transfer_out, 1 transfer_in)
  INSERT INTO transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  VALUES (auth.uid(), p_from_wallet_id, p_amount, 'transfer_out', 'must_have', p_note, now(), v_family_id);

  INSERT INTO transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  VALUES (auth.uid(), p_to_wallet_id, p_amount, 'transfer_in', 'must_have', p_note, now(), v_family_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ 2. DATA BACKFILL SCRIPT ============
-- Find transactions with NULL family_id for users who are in a family, and update them

DO $$
DECLARE
    v_count INT;
BEGIN
    -- Update transactions
    WITH updated_rows AS (
        UPDATE transactions t
        SET family_id = fm.family_id
        FROM family_members fm
        WHERE t.user_id = fm.user_id 
          AND t.family_id IS NULL
        RETURNING t.id
    )
    SELECT count(*) INTO v_count FROM updated_rows;

    RAISE NOTICE 'Updated % transactions with missing family_id', v_count;
END $$;
