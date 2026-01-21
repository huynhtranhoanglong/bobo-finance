-- ============================================================
-- EVENT INTEGRATION IN TRANSACTIONS (v1.6.1)
-- Date: 2026-01-21
-- Purpose: Update transaction RPCs to support event_id
-- ============================================================

-- ============ 1. UPDATE CREATE TRANSACTION ============

DROP FUNCTION IF EXISTS create_transaction_and_update_wallet(uuid, decimal, transaction_type, spending_category, text, timestamptz);

CREATE OR REPLACE FUNCTION create_transaction_and_update_wallet(
  p_wallet_id uuid,
  p_amount decimal,
  p_type transaction_type,
  p_category spending_category,
  p_note text,
  p_date timestamptz,
  p_event_id uuid DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_family_id uuid;
BEGIN
  -- Get user's family_id (or null if not in family)
  v_family_id := get_user_family_id();
  
  -- 1. Thêm giao dịch mới vào bảng transactions
  INSERT INTO transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id, event_id)
  VALUES (auth.uid(), p_wallet_id, p_amount, p_type, p_category, p_note, p_date, v_family_id, p_event_id);

  -- 2. Cập nhật số dư ví (Logic cộng/trừ)
  IF p_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
    -- Nếu là Chi tiêu / Trả nợ / Chuyển đi -> TRỪ tiền
    UPDATE wallets 
    SET balance = balance - p_amount 
    WHERE id = p_wallet_id;
    
  ELSIF p_type IN ('income', 'transfer_in') THEN
    -- Nếu là Thu nhập / Nhận tiền -> CỘNG tiền
    UPDATE wallets 
    SET balance = balance + p_amount 
    WHERE id = p_wallet_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ 2. UPDATE UPDATE TRANSACTION V3 ============

DROP FUNCTION IF EXISTS update_transaction_v3(uuid, decimal, text, timestamptz, uuid, spending_category);

CREATE OR REPLACE FUNCTION update_transaction_v3(
  p_id uuid,
  p_new_amount decimal,
  p_new_note text,
  p_new_date timestamptz,
  p_new_wallet_id uuid,
  p_new_category spending_category,
  p_new_event_id uuid DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_old_amount decimal;
  v_old_wallet_id uuid;
  v_old_type transaction_type;
  v_diff decimal;
BEGIN
  -- 1. Lấy thông tin giao dịch cũ
  SELECT amount, wallet_id, type INTO v_old_amount, v_old_wallet_id, v_old_type
  FROM transactions WHERE id = p_id;

  -- 2. Xử lý thay đổi wallet
  IF v_old_wallet_id != p_new_wallet_id THEN
    -- Hoàn tiền về ví cũ
    IF v_old_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
      UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
    ELSIF v_old_type IN ('income', 'transfer_in') THEN
      UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
    END IF;

    -- Áp dụng vào ví mới
    IF v_old_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
      UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id;
    ELSIF v_old_type IN ('income', 'transfer_in') THEN
      UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
    END IF;
  ELSE
    -- Same wallet, chỉ xử lý chênh lệch
    v_diff := p_new_amount - v_old_amount;
    IF v_diff != 0 THEN
      IF v_old_type IN ('expense', 'debt_repayment', 'transfer_out') THEN
        UPDATE wallets SET balance = balance - v_diff WHERE id = p_new_wallet_id;
      ELSIF v_old_type IN ('income', 'transfer_in') THEN
        UPDATE wallets SET balance = balance + v_diff WHERE id = p_new_wallet_id;
      END IF;
    END IF;
  END IF;

  -- 3. Update transaction record
  UPDATE transactions
  SET 
    amount = p_new_amount,
    note = p_new_note,
    date = p_new_date,
    wallet_id = p_new_wallet_id,
    category_level = p_new_category,
    event_id = p_new_event_id
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ 3. GRANT PERMISSIONS ============

GRANT EXECUTE ON FUNCTION create_transaction_and_update_wallet(uuid, decimal, transaction_type, spending_category, text, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_transaction_v3(uuid, decimal, text, timestamptz, uuid, spending_category, uuid) TO authenticated;
