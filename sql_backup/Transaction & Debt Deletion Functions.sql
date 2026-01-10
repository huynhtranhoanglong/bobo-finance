-- 1. Hàm XÓA GIAO DỊCH (Tự động hoàn tiền về ví/nợ)
create or replace function delete_transaction(p_transaction_id uuid) returns void as $$
declare
  v_amount decimal;
  v_wallet_id uuid;
  v_type transaction_type;
  v_related_debt_id uuid;
begin
  -- Lấy thông tin giao dịch trước khi xóa
  select amount, wallet_id, type, related_debt_id 
  into v_amount, v_wallet_id, v_type, v_related_debt_id
  from transactions where id = p_transaction_id;

  -- A. Hoàn tiền lại vào Ví (Revert Wallet Balance)
  if v_type in ('expense', 'debt_repayment', 'transfer_out') then
     -- Lúc trước trừ tiền, giờ cộng lại
     update wallets set balance = balance + v_amount where id = v_wallet_id;
  elsif v_type in ('income', 'transfer_in') then
     -- Lúc trước cộng tiền, giờ trừ đi
     update wallets set balance = balance - v_amount where id = v_wallet_id;
  end if;

  -- B. Nếu là Trả nợ -> Phải cộng lại nợ gốc (Revert Debt)
  if v_type = 'debt_repayment' and v_related_debt_id is not null then
     update debts set remaining_amount = remaining_amount + v_amount where id = v_related_debt_id;
  end if;

  -- C. Xóa dòng giao dịch
  delete from transactions where id = p_transaction_id;
end;
$$ language plpgsql security definer;


-- 2. Hàm XÓA KHOẢN NỢ (Nguy hiểm: Xóa nợ -> Xóa luôn lịch sử trả nợ -> Hoàn tiền ví)
create or replace function delete_debt(p_debt_id uuid) returns void as $$
declare
  t record;
begin
  -- Duyệt qua tất cả giao dịch trả nợ của khoản nợ này để xóa từng cái (để kích hoạt logic hoàn tiền ví)
  -- Lưu ý: Cách này hơi chậm nhưng an toàn cho dữ liệu
  for t in select id from transactions where related_debt_id = p_debt_id loop
    perform delete_transaction(t.id);
  end loop;

  -- Sau khi xóa hết lịch sử trả nợ, xóa khoản nợ gốc
  delete from debts where id = p_debt_id;
end;
$$ language plpgsql security definer;