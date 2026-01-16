-- ============================================================
-- FAMILY FEATURE - UPDATE OTHER RPC FUNCTIONS (v1.3.1)
-- Date: 2026-01-16
-- Purpose: Update existing RPC functions to auto-attach family_id
-- ============================================================

-- ============ 1. UPDATE CREATE TRANSACTION ============

create or replace function create_transaction_and_update_wallet(
  p_wallet_id uuid,
  p_amount decimal,
  p_type transaction_type,
  p_category spending_category,
  p_note text,
  p_date timestamptz
) returns void as $$
declare
  v_family_id uuid;
begin
  -- Get user's family_id (or null if not in family)
  v_family_id := get_user_family_id();
  
  -- 1. Thêm giao dịch mới vào bảng transactions
  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  values (auth.uid(), p_wallet_id, p_amount, p_type, p_category, p_note, p_date, v_family_id);

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


-- ============ 2. UPDATE CREATE NEW DEBT ============

create or replace function create_new_debt_v2(
  p_name text,
  p_total_amount decimal,
  p_paid_amount decimal,
  p_type text,
  p_interest_level text,
  p_wallet_id uuid,
  p_create_transaction boolean
) returns uuid as $$
declare
  v_debt_id uuid;
  v_remaining_amount decimal;
  v_trans_type transaction_type;
  v_family_id uuid;
begin
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- Tính remaining amount dựa trên paid_amount
  v_remaining_amount := p_total_amount - p_paid_amount;
  if v_remaining_amount < 0 then v_remaining_amount := 0; end if;

  -- 1. Tạo Debt record
  insert into debts (user_id, name, total_amount, remaining_amount, type, interest_level, family_id)
  values (auth.uid(), p_name, p_total_amount, v_remaining_amount, p_type::debt_type, p_interest_level::debt_interest, v_family_id)
  returning id into v_debt_id;

  -- 2. Nếu có tạo transaction (không phải "chỉ ghi sổ")
  if p_create_transaction = true and p_wallet_id is not null and v_remaining_amount > 0 then
    -- Xác định loại giao dịch dựa trên loại nợ
    if p_type = 'payable' then
      v_trans_type := 'income';  -- Vay = Tiền vào
    else
      v_trans_type := 'expense'; -- Cho vay = Tiền ra
    end if;

    -- Tạo transaction
    insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, related_debt_id, family_id)
    values (
      auth.uid(), 
      p_wallet_id, 
      v_remaining_amount, 
      v_trans_type,
      'must_have',
      'Ghi nhận khoản nợ: ' || p_name,
      now(),
      v_debt_id,
      v_family_id
    );

    -- Cập nhật wallet
    if v_trans_type = 'income' then
      update wallets set balance = balance + v_remaining_amount where id = p_wallet_id;
    else
      update wallets set balance = balance - v_remaining_amount where id = p_wallet_id;
    end if;
  end if;

  return v_debt_id;
end;
$$ language plpgsql security definer;


-- ============ 3. UPDATE PAY DEBT ============

create or replace function pay_debt(
  p_debt_id uuid,
  p_wallet_id uuid,
  p_amount decimal
) returns void as $$
declare
  v_debt_type debt_type;
  v_old_remaining decimal;
  v_family_id uuid;
begin
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- Lấy thông tin nợ
  select type, remaining_amount 
  into v_debt_type, v_old_remaining
  from debts where id = p_debt_id;

  -- 1. Tạo giao dịch trả nợ
  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, related_debt_id, family_id)
  values (
    auth.uid(), 
    p_wallet_id, 
    p_amount, 
    'debt_repayment',
    'must_have',
    'Trả nợ',
    now(),
    p_debt_id,
    v_family_id
  );

  -- 2. Cập nhật ví (trừ tiền - nếu là nợ phải trả)
  if v_debt_type = 'payable' then
    update wallets set balance = balance - p_amount where id = p_wallet_id;
  else
    -- Nhận tiền từ người nợ
    update wallets set balance = balance + p_amount where id = p_wallet_id;
  end if;

  -- 3. Giảm remaining_amount
  update debts 
  set remaining_amount = remaining_amount - p_amount 
  where id = p_debt_id;
end;
$$ language plpgsql security definer;


-- ============ 4. UPDATE TRANSFER FUNDS ============

create or replace function transfer_funds(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount decimal,
  p_note text
) returns void as $$
declare
  v_family_id uuid;
begin
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- 1. Trừ tiền từ ví nguồn
  update wallets set balance = balance - p_amount where id = p_from_wallet_id;

  -- 2. Cộng tiền vào ví đích
  update wallets set balance = balance + p_amount where id = p_to_wallet_id;

  -- 3. Tạo 2 transaction (1 transfer_out, 1 transfer_in)
  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  values (auth.uid(), p_from_wallet_id, p_amount, 'transfer_out', 'must_have', p_note, now(), v_family_id);

  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, family_id)
  values (auth.uid(), p_to_wallet_id, p_amount, 'transfer_in', 'must_have', p_note, now(), v_family_id);
end;
$$ language plpgsql security definer;


-- ============ 5. UPDATE UPDATE DEBT V2 ============

create or replace function update_debt_v2(
  p_id uuid,
  p_name text,
  p_total_amount decimal,
  p_paid_amount decimal,
  p_wallet_id uuid,
  p_update_wallet boolean
) returns void as $$
declare
  v_old_remaining decimal;
  v_new_remaining decimal;
  v_diff decimal;
  v_debt_type debt_type;
  v_trans_type transaction_type;
  v_family_id uuid;
begin
  -- Get user's family_id
  v_family_id := get_user_family_id();
  
  -- 1. Lấy thông tin cũ
  select remaining_amount, type into v_old_remaining, v_debt_type
  from debts where id = p_id;

  -- 2. Tính remaining mới
  v_new_remaining := p_total_amount - p_paid_amount;
  if v_new_remaining < 0 then v_new_remaining := 0; end if;

  -- 3. Update debt record
  update debts 
  set name = p_name, total_amount = p_total_amount, remaining_amount = v_new_remaining
  where id = p_id;

  -- 4. Xử lý wallet nếu cần
  if p_update_wallet = true and p_wallet_id is not null then
     v_diff := v_new_remaining - v_old_remaining;
     
     if v_diff <> 0 then
        -- Xác định loại giao dịch
        if v_debt_type = 'payable' then
           if v_diff > 0 then
              v_trans_type := 'income'; -- Nợ tăng = tiền vào
           else
              v_trans_type := 'expense'; -- Nợ giảm = tiền ra (trả bớt)
           end if;
        else
           if v_diff > 0 then
              v_trans_type := 'expense'; -- Cho vay tăng = tiền ra
           else
              v_trans_type := 'income'; -- Cho vay giảm = tiền vào (được trả)
           end if;
        end if;

        -- Tạo transaction ghi nhận thay đổi
        insert into transactions (user_id, wallet_id, amount, type, category_level, note, date, related_debt_id, family_id)
        values (
          auth.uid(), 
          p_wallet_id, 
          abs(v_diff), 
          v_trans_type,
          'must_have',
          'Điều chỉnh khoản nợ',
          now(),
          p_id,
          v_family_id
        );

        -- Cập nhật wallet
        if v_trans_type = 'income' then
           update wallets set balance = balance + abs(v_diff) where id = p_wallet_id;
        else
           update wallets set balance = balance - abs(v_diff) where id = p_wallet_id;
        end if;
     end if;
  end if;
end;
$$ language plpgsql security definer;


-- ============ 6. UPDATE DELETE TRANSACTION V2 ============
-- (No family_id needed - just reverses existing transaction)
-- Original function is already fine, no changes needed
