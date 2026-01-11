-- Hàm TẠO VÍ MỚI + SỐ DƯ ĐẦU KỲ
-- Logic:
-- 1. Tạo ví với số dư p_initial_balance
-- 2. Nếu số dư != 0, tự động tạo giao dịch để khớp dòng tiền
--    - Dương (> 0) -> Tạo Income "Số dư ban đầu"
--    - Âm (< 0) -> Tạo Expense "Số dư ban đầu" (Ghi nợ cũ)

create or replace function create_wallet_with_initial_balance(
  p_name text,
  p_fund_id uuid,
  p_initial_balance decimal
) returns void as $$
declare
  v_wallet_id uuid;
begin
  -- 1. Insert Ví mới
  insert into wallets (name, fund_id, balance, user_id)
  values (p_name, p_fund_id, p_initial_balance, auth.uid())
  returning id into v_wallet_id;

  -- 2. Tự động tạo giao dịch khởi tạo (nếu có số dư)
  if p_initial_balance > 0 then
     -- Dư dương: Coi như một khoản thu nhập ban đầu
     insert into transactions (wallet_id, amount, type, category_level, note, date, user_id)
     values (v_wallet_id, p_initial_balance, 'income', 'other_income', 'Số dư ban đầu', now(), auth.uid());
     
  elsif p_initial_balance < 0 then
     -- Dư âm: Coi như một khoản chi tiêu/nợ cũ (Amount phải là số dương)
     insert into transactions (wallet_id, amount, type, category_level, note, date, user_id)
     values (v_wallet_id, abs(p_initial_balance), 'expense', 'must_have', 'Số dư ban đầu (Âm)', now(), auth.uid());
  end if;

end;
$$ language plpgsql security definer;
