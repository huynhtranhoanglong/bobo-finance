-- FIX SECURITY ISSUES (v1.0.14)
-- Date: 2026-01-11
-- Issue: Dashboard displaying data from other users due to missing auth.uid() checks.

-- 1. FIX: get_financial_metrics
-- Thêm điều kiện lọc user_id = auth.uid() vào tất cả các query.
create or replace function get_financial_metrics()
returns json as $$
declare
  min_spend decimal;
  std_spend decimal;
  total_assets decimal;
  safety_target decimal;
  freedom_target decimal;
begin
  -- 1. Tính Chi tiêu Tối thiểu (Trung bình 1 tháng dựa trên 90 ngày gần nhất)
  select coalesce(sum(amount), 0) / 3 into min_spend
  from transactions
  where type = 'expense'
  and category_level = 'must_have'
  and date > (now() - interval '90 days')
  and user_id = auth.uid(); -- FIX: Thêm lọc User

  -- 2. Tính Chi tiêu Tiêu chuẩn (Must have + Nice to have)
  select coalesce(sum(amount), 0) / 3 into std_spend
  from transactions
  where type = 'expense'
  and category_level in ('must_have', 'nice_to_have')
  and date > (now() - interval '90 days')
  and user_id = auth.uid(); -- FIX: Thêm lọc User

  -- 3. Tính Tổng tài sản (Net Worth) - Tổng tiền trong các ví
  select coalesce(sum(balance), 0) into total_assets 
  from wallets
  where user_id = auth.uid(); -- FIX: Thêm lọc User

  -- 4. Tính Mục tiêu (Công thức 25 năm)
  if min_spend = 0 then min_spend := 1; end if;
  if std_spend = 0 then std_spend := 1; end if;

  safety_target := min_spend * 12 * 25;
  freedom_target := std_spend * 12 * 25;

  -- 5. Trả về kết quả dạng JSON
  return json_build_object(
    'net_worth', total_assets,
    'min_monthly_spend', min_spend,
    'std_monthly_spend', std_spend,
    'safety_target', safety_target,
    'freedom_target', freedom_target,
    'safety_progress', (total_assets / safety_target) * 100,
    'freedom_progress', (total_assets / freedom_target) * 100
  );
end;
$$ language plpgsql security definer;


-- 2. FIX: update_transaction_v2
-- Thêm kiểm tra quyền sở hữu transaction và wallet trước khi update.
create or replace function update_transaction_v2(
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
  v_user_id uuid;
begin
  -- A. Lấy thông tin CŨ và CHECK SỞ HỮU
  select amount, wallet_id, type, user_id
  into v_old_amount, v_old_wallet_id, v_type, v_user_id
  from transactions where id = p_id;

  -- FIX: Kiểm tra quyền sở hữu
  if v_user_id != auth.uid() then
    raise exception 'Unauthorized: You do not own this transaction';
  end if;

  -- B. Hoàn lại tiền CŨ vào ví CŨ (Revert Old)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance + v_old_amount 
     where id = v_old_wallet_id and user_id = auth.uid(); -- An toàn hơn
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance - v_old_amount 
     where id = v_old_wallet_id and user_id = auth.uid();
  end if;

  -- C. Trừ/Cộng tiền MỚI vào ví MỚI (Apply New)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance - p_new_amount 
     where id = p_new_wallet_id and user_id = auth.uid(); -- An toàn hơn
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance + p_new_amount 
     where id = p_new_wallet_id and user_id = auth.uid();
  end if;

  -- D. Cập nhật dòng giao dịch
  update transactions 
  set 
    amount = p_new_amount, 
    note = p_new_note, 
    date = p_new_date, 
    wallet_id = p_new_wallet_id,
    category_level = p_new_category
  where id = p_id and user_id = auth.uid(); -- FIX: Double check
  
end;
$$ language plpgsql security definer;


-- 3. FIX: delete_transaction_v2
-- Thêm kiểm tra quyền sở hữu trước khi xóa.
create or replace function delete_transaction_v2(p_transaction_id uuid) returns void as $$
declare
  v_amount decimal;
  v_wallet_id uuid;
  v_type transaction_type;
  v_related_debt_id uuid;
  v_user_id uuid;
begin
  -- 1. Lấy thông tin giao dịch cần xóa và CHECK SỞ HỮU
  select amount, wallet_id, type, related_debt_id, user_id
  into v_amount, v_wallet_id, v_type, v_related_debt_id, v_user_id
  from transactions where id = p_transaction_id;

  -- FIX: Kiểm tra quyền sở hữu
  if v_user_id != auth.uid() then
    raise exception 'Unauthorized: You do not own this transaction';
  end if;

  -- 2. Hoàn tiền lại vào Ví (Revert Wallet Balance)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     update wallets set balance = balance + v_amount 
     where id = v_wallet_id and user_id = auth.uid();
  elsif v_type in ('income', 'transfer_in') then
     update wallets set balance = balance - v_amount 
     where id = v_wallet_id and user_id = auth.uid();
  end if;

  -- 3. Xử lý Nợ (Logic Mới)
  if v_related_debt_id is not null then
     if v_type = 'debt_repayment' then
        update debts set remaining_amount = remaining_amount + v_amount 
        where id = v_related_debt_id and user_id = auth.uid();
        
     elsif v_type in ('income', 'expense') then
        update debts 
        set 
          total_amount = total_amount - v_amount,
          remaining_amount = remaining_amount - v_amount
        where id = v_related_debt_id and user_id = auth.uid();
     end if;
  end if;

  -- 4. Xóa dòng giao dịch
  delete from transactions where id = p_transaction_id and user_id = auth.uid();
end;
$$ language plpgsql security definer;
