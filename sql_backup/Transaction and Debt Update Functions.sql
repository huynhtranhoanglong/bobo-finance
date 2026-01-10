-- 1. Hàm SỬA GIAO DỊCH (Update Transaction)
create or replace function update_transaction(
  p_id uuid,
  p_new_amount decimal,
  p_new_note text,
  p_new_date timestamptz,
  p_new_wallet_id uuid -- Cho phép chuyển sang ví khác nếu lỡ chọn nhầm
) returns void as $$
declare
  v_old_amount decimal;
  v_old_wallet_id uuid;
  v_type transaction_type;
begin
  -- A. Lấy thông tin CŨ
  select amount, wallet_id, type 
  into v_old_amount, v_old_wallet_id, v_type
  from transactions where id = p_id;

  -- B. Hoàn lại tiền CŨ (Revert Old)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance + v_old_amount where id = v_old_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance - v_old_amount where id = v_old_wallet_id;
  end if;

  -- C. Trừ/Cộng tiền MỚI (Apply New)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance - p_new_amount where id = p_new_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance + p_new_amount where id = p_new_wallet_id;
  end if;

  -- D. Cập nhật dòng giao dịch
  update transactions 
  set amount = p_new_amount, note = p_new_note, date = p_new_date, wallet_id = p_new_wallet_id
  where id = p_id;
  
  -- E. Nếu là trả nợ, phải cập nhật cả dư nợ (Logic này phức tạp nên tạm thời nếu sửa số tiền trả nợ, 
  -- ta chỉ update ví, còn nợ thì khuyên user nên xóa đi tạo lại trả nợ mới để chuẩn xác nhất).
end;
$$ language plpgsql security definer;


-- 2. Hàm SỬA KHOẢN NỢ (Update Debt)
create or replace function update_debt(
  p_id uuid,
  p_new_name text,
  p_new_total decimal
) returns void as $$
declare
  v_old_total decimal;
  v_diff decimal;
begin
  -- Lấy tổng vay cũ
  select total_amount into v_old_total from debts where id = p_id;
  
  -- Tính chênh lệch (Ví dụ: Vay thêm 5tr thì diff = 5tr)
  v_diff := p_new_total - v_old_total;

  -- Cập nhật Nợ: Tăng tổng vay và Tăng dư nợ còn lại theo chênh lệch
  update debts 
  set name = p_new_name, 
      total_amount = p_new_total,
      remaining_amount = remaining_amount + v_diff
  where id = p_id;
end;
$$ language plpgsql security definer;