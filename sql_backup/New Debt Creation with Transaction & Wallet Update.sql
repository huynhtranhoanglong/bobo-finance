create or replace function create_new_debt(
  p_name text,
  p_amount decimal,
  p_type debt_type,            -- 'payable' (đi vay) hoặc 'receivable' (cho vay)
  p_interest debt_interest_level, 
  p_wallet_id uuid,            -- Ví nhận tiền (hoặc chi tiền)
  p_note text,
  p_date timestamptz
) returns void as $$
declare
  v_new_debt_id uuid;
begin
  -- 1. Tạo khoản nợ mới trong bảng debts
  insert into debts (user_id, name, total_amount, remaining_amount, type, interest_level, created_at)
  values (auth.uid(), p_name, p_amount, p_amount, p_type, p_interest, p_date)
  returning id into v_new_debt_id;

  -- 2. Xử lý dòng tiền (Nếu người dùng chọn ví)
  if p_wallet_id is not null then
    
    -- TRƯỜNG HỢP 1: ĐI VAY (PAYABLE) -> Tiền VÀO ví (Income)
    if p_type = 'payable' then
       insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
       values (auth.uid(), p_wallet_id, v_new_debt_id, p_amount, 'income', 'other_income', p_note, p_date);
       
       update wallets set balance = balance + p_amount where id = p_wallet_id;
       
    -- TRƯỜNG HỢP 2: CHO VAY (RECEIVABLE) -> Tiền RA ví (Expense)
    elsif p_type = 'receivable' then
       insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
       values (auth.uid(), p_wallet_id, v_new_debt_id, p_amount, 'expense', 'nice_to_have', p_note, p_date);
       
       update wallets set balance = balance - p_amount where id = p_wallet_id;
    end if;

  end if;
end;
$$ language plpgsql security definer;