-- ============================================================
-- FIX: CREATE WALLET MISSING FAMILY_ID (v1.3.14)
-- Date: 2026-01-16
-- Purpose: Add family_id to create_wallet_with_initial_balance
-- ============================================================

create or replace function create_wallet_with_initial_balance(
  p_name text,
  p_fund_id uuid,
  p_initial_balance decimal
) returns void as $$
declare
  v_wallet_id uuid;
  v_family_id uuid;
begin
  -- Get user's family_id (or null if not in family)
  v_family_id := get_user_family_id();
  
  -- 1. Insert Ví mới with family_id
  insert into wallets (name, fund_id, balance, user_id, family_id, visibility)
  values (p_name, p_fund_id, p_initial_balance, auth.uid(), v_family_id, 'shared')
  returning id into v_wallet_id;

  -- 2. Tự động tạo giao dịch khởi tạo (nếu có số dư)
  if p_initial_balance > 0 then
     -- Dư dương: Coi như một khoản thu nhập ban đầu
     insert into transactions (wallet_id, amount, type, category_level, note, date, user_id, family_id)
     values (v_wallet_id, p_initial_balance, 'income', 'other_income', 'Số dư ban đầu', now(), auth.uid(), v_family_id);
     
  elsif p_initial_balance < 0 then
     -- Dư âm: Coi như một khoản chi tiêu/nợ cũ (Amount phải là số dương)
     insert into transactions (wallet_id, amount, type, category_level, note, date, user_id, family_id)
     values (v_wallet_id, abs(p_initial_balance), 'expense', 'must_have', 'Số dư ban đầu (Âm)', now(), auth.uid(), v_family_id);
  end if;

end;
$$ language plpgsql security definer;
