create or replace function transfer_funds(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount decimal,
  p_note text,
  p_date timestamptz
) returns void as $$
begin
  -- 1. Trừ tiền ví đi (Transfer Out)
  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date)
  values (auth.uid(), p_from_wallet_id, p_amount, 'transfer_out', null, p_note, p_date);

  update wallets set balance = balance - p_amount where id = p_from_wallet_id;

  -- 2. Cộng tiền ví đến (Transfer In)
  insert into transactions (user_id, wallet_id, amount, type, category_level, note, date)
  values (auth.uid(), p_to_wallet_id, p_amount, 'transfer_in', null, p_note, p_date);

  update wallets set balance = balance + p_amount where id = p_to_wallet_id;
end;
$$ language plpgsql security definer;