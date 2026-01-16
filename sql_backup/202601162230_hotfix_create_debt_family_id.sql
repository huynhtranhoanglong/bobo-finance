-- ============================================================
-- HOTFIX: CREATE DEBT MISSING FAMILY_ID (v1.3.14)
-- Date: 2026-01-16
-- Purpose: Fix create_new_debt_v2 to include family_id
-- ============================================================

create or replace function create_new_debt_v2(
  p_name text,
  p_total_amount decimal,
  p_paid_amount decimal,
  p_type text,
  p_interest_level text,
  p_wallet_id uuid,
  p_create_transaction boolean
) returns uuid as $$
declare
  v_debt_id uuid;
  v_remaining_amount decimal;
  v_trans_type transaction_type;
  v_family_id uuid;
begin
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- Tính remaining amount dựa trên paid_amount
  v_remaining_amount := p_total_amount - p_paid_amount;
  if v_remaining_amount < 0 then v_remaining_amount := 0; end if;

  -- 1. Tạo Debt record với family_id
  insert into debts (user_id, name, total_amount, remaining_amount, type, interest_level, family_id)
  values (auth.uid(), p_name, p_total_amount, v_remaining_amount, p_type::debt_type, p_interest_level::debt_interest, v_family_id)
  returning id into v_debt_id;

  -- 2. Nếu có tạo transaction (không phải "chỉ ghi sổ")
  if p_create_transaction = true and p_wallet_id is not null and v_remaining_amount > 0 then
    -- Xác định loại giao dịch dựa trên loại nợ
    if p_type = 'payable' then
      v_trans_type := 'income';  -- Vay = Tiền vào
    else
      v_trans_type := 'expense'; -- Cho vay = Tiền ra
    end if;

    -- Tạo transaction với family_id
    insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, related_debt_id, family_id)
    values (
      auth.uid(), 
      p_wallet_id, 
      v_remaining_amount, 
      v_trans_type,
      'must_have',
      'Ghi nhận khoản nợ: ' || p_name,
      now(),
      v_debt_id,
      v_family_id
    );

    -- Cập nhật wallet
    if v_trans_type = 'income' then
      update wallets set balance = balance + v_remaining_amount where id = p_wallet_id;
    else
      update wallets set balance = balance - v_remaining_amount where id = p_wallet_id;
    end if;
  end if;

  return v_debt_id;
end;
$$ language plpgsql security definer;
