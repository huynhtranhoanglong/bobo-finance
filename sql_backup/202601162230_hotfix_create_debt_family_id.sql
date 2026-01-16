-- ============================================================
-- HOTFIX V2: CREATE DEBT MISSING FAMILY_ID (v1.3.14)
-- Date: 2026-01-16
-- Purpose: Fix create_new_debt_v2 to include family_id
-- NOTE: Must match the EXACT signature that frontend calls
-- ============================================================

-- Drop existing functions to avoid overload issues
DROP FUNCTION IF EXISTS create_new_debt_v2(text, decimal, decimal, text, text, uuid, boolean);
DROP FUNCTION IF EXISTS create_new_debt_v2(text, decimal, decimal, debt_type, debt_interest_level, uuid, text, timestamptz, boolean);

-- Recreate with correct signature (matching frontend call)
create or replace function create_new_debt_v2(
  p_name text,
  p_total_amount decimal,
  p_paid_amount decimal,
  p_type debt_type,
  p_interest debt_interest_level,
  p_wallet_id uuid,
  p_note text,
  p_date timestamptz,
  p_create_transaction boolean
) returns void as $$
declare
  v_new_debt_id uuid;
  v_remaining_amount decimal;
  v_family_id uuid;
begin
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- Tính số tiền còn lại
  v_remaining_amount := p_total_amount - p_paid_amount;
  if v_remaining_amount < 0 then v_remaining_amount := 0; end if;

  -- 1. Tạo khoản nợ mới trong bảng debts với family_id
  insert into debts (user_id, name, total_amount, remaining_amount, type, interest_level, created_at, family_id)
  values (auth.uid(), p_name, p_total_amount, v_remaining_amount, p_type, p_interest, p_date, v_family_id)
  returning id into v_new_debt_id;

  -- 2. Xử lý dòng tiền (Chỉ khi user YÊU CẦU tạo giao dịch VÀ có chọn ví)
  if p_create_transaction = true and p_wallet_id is not null and v_remaining_amount > 0 then
    
    -- TRƯỜNG HỢP 1: ĐI VAY (PAYABLE) -> Tiền VÀO ví (Income)
    if p_type = 'payable' then
       insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date, family_id)
       values (auth.uid(), p_wallet_id, v_new_debt_id, v_remaining_amount, 'income', 'other_income', p_note, p_date, v_family_id);
       
       update wallets set balance = balance + v_remaining_amount where id = p_wallet_id;
       
    -- TRƯỜNG HỢP 2: CHO VAY (RECEIVABLE) -> Tiền RA ví (Expense)
    elsif p_type = 'receivable' then
       insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date, family_id)
       values (auth.uid(), p_wallet_id, v_new_debt_id, v_remaining_amount, 'expense', 'nice_to_have', p_note, p_date, v_family_id);
       
       update wallets set balance = balance - v_remaining_amount where id = p_wallet_id;
    end if;

  end if;
end;
$$ language plpgsql security definer;
