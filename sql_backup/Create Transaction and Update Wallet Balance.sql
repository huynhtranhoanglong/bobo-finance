-- Hàm tạo giao dịch và tự động cập nhật số dư ví
create or replace function create_transaction_and_update_wallet(
  p_wallet_id uuid,
  p_amount decimal,
  p_type transaction_type,
  p_category spending_category,
  p_note text,
  p_date timestamptz
) returns void as $$
begin
  -- 1. Thêm giao dịch mới vào bảng transactions
  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date)
  values (auth.uid(), p_wallet_id, p_amount, p_type, p_category, p_note, p_date);

  -- 2. Cập nhật số dư ví (Logic cộng/trừ)
  if p_type in ('expense', 'debt_repayment', 'transfer_out') then
    -- Nếu là Chi tiêu / Trả nợ / Chuyển đi -> TRỪ tiền
    update wallets 
    set balance = balance - p_amount 
    where id = p_wallet_id;
    
  elsif p_type in ('income', 'transfer_in') then
    -- Nếu là Thu nhập / Nhận tiền -> CỘNG tiền
    update wallets 
    set balance = balance + p_amount 
    where id = p_wallet_id;
  end if;
end;
$$ language plpgsql security definer;