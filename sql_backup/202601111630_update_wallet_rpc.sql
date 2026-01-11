-- Hàm CẬP NHẬT VÍ MỚI + TỰ ĐỘNG ĐIỀU CHỈNH SỐ DƯ
-- Logic:
-- 1. Lấy số dư cũ
-- 2. Cập nhật thông tin ví (Tên, Quỹ, Số dư mới)
-- 3. Tính chênh lệch (Diff = Mới - Cũ)
-- 4. Tạo giao dịch điều chỉnh nếu có chênh lệch
--    - Diff > 0 -> Income "Điều chỉnh số dư"
--    - Diff < 0 -> Expense "Điều chỉnh số dư"

create or replace function update_wallet_with_adjustment(
  p_wallet_id uuid,
  p_name text,
  p_fund_id uuid,
  p_new_balance decimal
) returns void as $$
declare
  v_old_balance decimal;
  v_diff decimal;
begin
  -- 1. Lấy số dư cũ
  select balance into v_old_balance from wallets where id = p_wallet_id;

  -- 2. Cập nhật ví
  update wallets
  set name = p_name,
      fund_id = p_fund_id,
      balance = p_new_balance
  where id = p_wallet_id;

  -- 3. Tính chênh lệch
  v_diff := p_new_balance - v_old_balance;

  -- 4. Tạo giao dịch điều chỉnh (nếu có)
  if v_diff > 0 then
     -- Tăng số dư -> Income
     insert into transactions (wallet_id, amount, type, category_level, note, date, user_id)
     values (p_wallet_id, v_diff, 'income', 'other_income', 'Điều chỉnh số dư (Tăng)', now(), auth.uid());
     
  elsif v_diff < 0 then
     -- Giảm số dư -> Expense
     insert into transactions (wallet_id, amount, type, category_level, note, date, user_id)
     values (p_wallet_id, abs(v_diff), 'expense', 'waste', 'Điều chỉnh số dư (Giảm)', now(), auth.uid());
  end if;

end;
$$ language plpgsql security definer;
