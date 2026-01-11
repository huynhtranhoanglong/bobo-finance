-- Hàm XÓA GIAO DỊCH V2 (Smart Delete)
-- Cải tiến: Tự động giảm nợ gốc nếu xóa giao dịch Tạo Nợ (Income/Expense có link tới Debt)

create or replace function delete_transaction_v2(p_transaction_id uuid) returns void as $$
declare
  v_amount decimal;
  v_wallet_id uuid;
  v_type transaction_type;
  v_related_debt_id uuid;
begin
  -- 1. Lấy thông tin giao dịch cần xóa
  select amount, wallet_id, type, related_debt_id 
  into v_amount, v_wallet_id, v_type, v_related_debt_id
  from transactions where id = p_transaction_id;

  -- 2. Hoàn tiền lại vào Ví (Revert Wallet Balance)
  -- (Giữ nguyên logic cũ)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     -- Lúc trước trừ, giờ cộng lại
     update wallets set balance = balance + v_amount where id = v_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     -- Lúc trước cộng, giờ trừ đi
     update wallets set balance = balance - v_amount where id = v_wallet_id;
  end if;

  -- 3. Xử lý Nợ (Logic Mới)
  if v_related_debt_id is not null then
  
     -- TH1: Xóa giao dịch TRẢ NỢ (Debt Repayment)
     if v_type = 'debt_repayment' then
        -- Trả lại nợ ông giáo (Cộng lại remaining_amount)
        update debts set remaining_amount = remaining_amount + v_amount where id = v_related_debt_id;
        
     -- TH2 (MỚI): Xóa giao dịch TẠO NỢ (Income/Expense)
     -- Ví dụ: Vay 10tr (Income) -> Xóa Income -> Nợ phải giảm 10tr
     elsif v_type in ('income', 'expense') then
        update debts 
        set 
          total_amount = total_amount - v_amount,
          remaining_amount = remaining_amount - v_amount
        where id = v_related_debt_id;
     end if;

  end if;

  -- 4. Xóa dòng giao dịch
  delete from transactions where id = p_transaction_id;
end;
$$ language plpgsql security definer;
