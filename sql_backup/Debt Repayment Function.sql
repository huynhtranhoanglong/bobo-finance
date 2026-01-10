create or replace function pay_debt(
  p_wallet_id uuid,
  p_debt_id uuid,
  p_amount decimal,
  p_note text,
  p_date timestamptz
) returns void as $$
begin
  -- 1. Trừ tiền trong Ví (Tiền đi ra)
  update wallets 
  set balance = balance - p_amount 
  where id = p_wallet_id;

  -- 2. Trừ nợ gốc trong bảng Debts (Nợ giảm đi)
  update debts 
  set remaining_amount = remaining_amount - p_amount 
  where id = p_debt_id;

  -- 3. Lưu lịch sử giao dịch (để thống kê)
  insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
  values (auth.uid(), p_wallet_id, p_debt_id, p_amount, 'debt_repayment', null, p_note, p_date);
end;
$$ language plpgsql security definer;