-- Hàm SỬA GIAO DỊCH V2 (Update Transaction V2)
-- Hỗ trợ sửa: Số tiền, Note, Ví, NGÀY, DANH MỤC
-- KHÔNG cho phép đổi TYPE (Để tránh rắc rối logic dòng tiền)

create or replace function update_transaction_v2(
  p_id uuid,
  p_new_amount decimal,
  p_new_note text,
  p_new_date timestamptz,
  p_new_wallet_id uuid, -- Cho phép chuyển sang ví khác nếu lỡ chọn nhầm
  p_new_category spending_category -- Cho phép chọn lại category (Must have / Nice to have...)
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

  -- B. Hoàn lại tiền CŨ vào ví CŨ (Revert Old)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     -- Lúc trước trừ, giờ cộng lại
     update wallets set balance = balance + v_old_amount where id = v_old_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     -- Lúc trước cộng, giờ trừ đi
     update wallets set balance = balance - v_old_amount where id = v_old_wallet_id;
  end if;

  -- C. Trừ/Cộng tiền MỚI vào ví MỚI (Apply New)
  -- Dùng lại đúng v_type (vì không cho sửa Type)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance - p_new_amount where id = p_new_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance + p_new_amount where id = p_new_wallet_id;
  end if;

  -- D. Cập nhật dòng giao dịch
  update transactions 
  set 
    amount = p_new_amount, 
    note = p_new_note, 
    date = p_new_date, 
    wallet_id = p_new_wallet_id,
    category_level = p_new_category
  where id = p_id;
  
end;
$$ language plpgsql security definer;
