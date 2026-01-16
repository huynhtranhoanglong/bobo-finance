-- Hàm tạo khoản nợ mới V2 (v1.2.5) hỗ trợ nhập nợ cũ (Historical Debt)
-- Date: 2026-01-16
-- Logic:
-- 1. Cho phép nhập "Đã trả" ngay từ đầu.
-- 2. Có tùy chọn "Chỉ ghi sổ" (p_create_transaction = false) -> Không tạo giao dịch ví.
-- 3. Nếu có tạo giao dịch (p_create_transaction = true), chỉ tạo với số tiền CÒN LẠI (Remaining).

create or replace function create_new_debt_v2(
  p_name text,
  p_total_amount decimal,      -- Tổng nợ gốc
  p_paid_amount decimal,       -- Số tiền đã trả trước đó (Mặc định 0 nếu nợ mới)
  p_type debt_type,            -- 'payable' (đi vay) hoặc 'receivable' (cho vay)
  p_interest debt_interest_level, 
  p_wallet_id uuid,            -- Ví nhận tiền (hoặc chi tiền) - Null nếu chỉ ghi sổ
  p_note text,
  p_date timestamptz,
  p_create_transaction boolean -- True: Cộng tiền vào ví, False: Chỉ ghi nợ
) returns void as $$
declare
  v_new_debt_id uuid;
  v_remaining_amount decimal;
begin
  -- Tính số tiền còn lại
  v_remaining_amount := p_total_amount - p_paid_amount;

  -- 1. Tạo khoản nợ mới trong bảng debts
  insert into debts (user_id, name, total_amount, remaining_amount, type, interest_level, created_at)
  values (auth.uid(), p_name, p_total_amount, v_remaining_amount, p_type, p_interest, p_date)
  returning id into v_new_debt_id;

  -- 2. Xử lý dòng tiền (Chỉ khi user YÊU CẦU tạo giao dịch VÀ có chọn ví)
  if p_create_transaction = true and p_wallet_id is not null and v_remaining_amount > 0 then
    
    -- TRƯỜNG HỢP 1: ĐI VAY (PAYABLE) -> Tiền VÀO ví (Income)
    -- Chỉ nhận số tiền CÒN LẠI về ví (vì phần đã trả coi như xong)
    if p_type = 'payable' then
       insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
       values (auth.uid(), p_wallet_id, v_new_debt_id, v_remaining_amount, 'income', 'other_income', p_note, p_date);
       
       update wallets set balance = balance + v_remaining_amount where id = p_wallet_id;
       
    -- TRƯỜNG HỢP 2: CHO VAY (RECEIVABLE) -> Tiền RA ví (Expense)
    -- Chỉ trừ số tiền CÒN LẠI khỏi ví
    elsif p_type = 'receivable' then
       insert into transactions (user_id, wallet_id, related_debt_id, amount, type, category_level, note, date)
       values (auth.uid(), p_wallet_id, v_new_debt_id, v_remaining_amount, 'expense', 'nice_to_have', p_note, p_date);
       
       update wallets set balance = balance - v_remaining_amount where id = p_wallet_id;
    end if;

  end if;
end;
$$ language plpgsql security definer;
