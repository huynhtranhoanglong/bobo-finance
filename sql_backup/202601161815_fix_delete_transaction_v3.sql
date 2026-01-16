-- ============================================================
-- TRANSACTION LOGIC FIX v1.3.11
-- Date: 2026-01-16
-- Purpose: Fix wallet balance not updating when deleting/updating transactions in Family context.
--          Replace v2 functions with v3 using SECURITY DEFINER and robust revert logic.
-- ============================================================

-- 1. Hàm XÓA GIAO DỊCH v3 (Robust Delete)
create or replace function delete_transaction_v3(p_transaction_id uuid) returns void as $$
declare
  v_amount decimal;
  v_wallet_id uuid;
  v_type transaction_type;
  v_related_debt_id uuid;
  v_record_exists boolean;
begin
  -- 1.1. Kiểm tra tồn tại
  select exists(select 1 from transactions where id = p_transaction_id) into v_record_exists;
  if not v_record_exists then
    raise exception 'Transaction not found or already deleted';
  end if;

  -- 1.2. Lấy thông tin giao dịch cần xóa
  select amount, wallet_id, type, related_debt_id 
  into v_amount, v_wallet_id, v_type, v_related_debt_id
  from transactions where id = p_transaction_id;

  -- 1.3. Hoàn tiền lại vào Ví (Revert Wallet Balance)
  -- SECURITY DEFINER sẽ cho phép bypass RLS để update ví shared 
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     -- Lúc trước trừ, giờ cộng lại
     update wallets set balance = balance + v_amount where id = v_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     -- Lúc trước cộng, giờ trừ đi
     update wallets set balance = balance - v_amount where id = v_wallet_id;
  end if;

  -- 1.4. Xử lý Hoàn Nợ (Revert Debt)
  if v_related_debt_id is not null then
     -- TH1: Xóa giao dịch TRẢ NỢ
     if v_type = 'debt_repayment' then
        -- Trả lại nợ gốc (Cộng lại remaining_amount)
        update debts set remaining_amount = remaining_amount + v_amount where id = v_related_debt_id;
        
     -- TH2: Xóa giao dịch TẠO NỢ (Vay thêm)
     elsif v_type in ('income', 'expense') then
        -- Giảm tổng nợ và dư nợ
        update debts 
        set 
          total_amount = total_amount - v_amount,
          remaining_amount = remaining_amount - v_amount
        where id = v_related_debt_id;
     end if;
  end if;

  -- 1.5. Xóa dòng giao dịch
  delete from transactions where id = p_transaction_id;
end;
$$ language plpgsql security definer;


-- 2. Hàm SỬA GIAO DỊCH v3 (Robust Update)
create or replace function update_transaction_v3(
  p_id uuid,
  p_new_amount decimal,
  p_new_note text,
  p_new_date timestamptz,
  p_new_wallet_id uuid,
  p_new_category spending_category
) returns void as $$
declare
  v_old_amount decimal;
  v_old_wallet_id uuid;
  v_type transaction_type;
  v_record_exists boolean;
begin
  -- 2.1. Kiểm tra tồn tại
  select exists(select 1 from transactions where id = p_id) into v_record_exists;
  if not v_record_exists then
    raise exception 'Transaction not found';
  end if;

  -- 2.2. Lấy thông tin CŨ
  select amount, wallet_id, type 
  into v_old_amount, v_old_wallet_id, v_type
  from transactions where id = p_id;

  -- 2.3. Hoàn lại tiền CŨ vào ví CŨ (Revert Old)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance + v_old_amount where id = v_old_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance - v_old_amount where id = v_old_wallet_id;
  end if;

  -- 2.4. Trừ/Cộng tiền MỚI vào ví MỚI (Apply New)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance - p_new_amount where id = p_new_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance + p_new_amount where id = p_new_wallet_id;
  end if;

  -- 2.5. Cập nhật dòng giao dịch
  update transactions 
  set 
    amount = p_new_amount, 
    note = p_new_note, 
    date = p_new_date, 
    wallet_id = p_new_wallet_id,
    category_level = p_new_category
  where id = p_id;
  
  -- Note: Nếu cập nhật giao dịch trả nợ, logic cập nhật dư nợ khá phức tạp (do phải revert cái cũ, apply cái mới vào khoản nợ).
  -- Hiện tại v3 tập trung vào fix lỗi ví. Logic nợ giữ nguyên (không update debt record khi edit transaction) 
  -- để an toàn. Nếu user muốn sửa số tiền trả nợ, tốt nhất là xóa đi tạo lại.
  
end;
$$ language plpgsql security definer;
