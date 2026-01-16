-- Hàm CẬP NHẬT khoản nợ V2 (v1.2.5) hỗ trợ tính toán lại số dư và cập nhật ví
-- Date: 2026-01-16

create or replace function update_debt_v2(
  p_id uuid,
  p_new_name text,
  p_new_total decimal,
  p_new_paid decimal,
  p_wallet_id uuid,          -- Ví để nhận/trừ tiền chênh lệch (nếu chọn)
  p_update_wallet boolean,    -- True: Có tính toán chênh lệch để cập nhật ví
  p_note text
) returns void as $$
declare
  v_old_total decimal;
  v_old_remaining decimal;
  v_new_remaining decimal;
  v_diff decimal;
  v_debt_type debt_type;
begin
  -- 1. Lấy thông tin CŨ
  select total_amount, remaining_amount, type 
  into v_old_total, v_old_remaining, v_debt_type
  from debts where id = p_id;
  
  -- 2. Tính toán số liệu MỚI
  v_new_remaining := p_new_total - p_new_paid;
  
  -- 3. Cập nhật bảng Debts
  update debts 
  set name = p_new_name, 
      total_amount = p_new_total,
      remaining_amount = v_new_remaining
  where id = p_id;
  
  -- 4. Xử lý ví (Nếu được yêu cầu)
  if p_update_wallet = true and p_wallet_id is not null then
     -- Tính chênh lệch: Số còn lại MỚI - Số còn lại CŨ
     -- Ví dụ Payble (Vay):
     -- Cũ còn 300, Mới còn 500 (Vay thêm) -> Diff = +200 -> Income (Tiền vào ví)
     -- Cũ còn 300, Mới còn 100 (Trả bớt) -> Diff = -200 -> Expense (Tiền ra ví)
     v_diff := v_new_remaining - v_old_remaining;
     
     if v_diff <> 0 then
        if v_debt_type = 'payable' then
           if v_diff > 0 then
              -- Vay thêm -> Tiền vào
              insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
              values (auth.uid(), p_wallet_id, p_id, v_diff, 'income', 'other_income', coalesce(p_note, 'Điều chỉnh tăng nợ'), now());
              update wallets set balance = balance + v_diff where id = p_wallet_id;
           else
              -- Trả bớt (Diff âm) -> Tiền ra
              insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
              values (auth.uid(), p_wallet_id, p_id, abs(v_diff), 'expense', 'nice_to_have', coalesce(p_note, 'Điều chỉnh giảm nợ'), now());
              update wallets set balance = balance - abs(v_diff) where id = p_wallet_id;
           end if;
           
        elsif v_debt_type = 'receivable' then
           if v_diff > 0 then
              -- Cho vay thêm -> Tiền ra
              insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
              values (auth.uid(), p_wallet_id, p_id, v_diff, 'expense', 'nice_to_have', coalesce(p_note, 'Điều chỉnh tăng cho vay'), now());
              update wallets set balance = balance - v_diff where id = p_wallet_id;
           else
              -- Thu nợ về (Diff âm) -> Tiền vào
              insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
              values (auth.uid(), p_wallet_id, p_id, abs(v_diff), 'income', 'other_income', coalesce(p_note, 'Điều chỉnh giảm cho vay'), now());
              update wallets set balance = balance + abs(v_diff) where id = p_wallet_id;
           end if;
        end if;
     end if;
  end if;
end;
$$ language plpgsql security definer;
