-- Cập nhật số dư Ví dựa trên tất cả giao dịch đã import
UPDATE wallets w
SET balance = w.balance 
  -- Cộng các khoản tiền vào (Income, Transfer In)
  + (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions t 
    WHERE t.wallet_id = w.id 
    AND t.type IN ('income', 'transfer_in')
  )
  -- Trừ các khoản tiền ra (Expense, Transfer Out, Trả nợ)
  - (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions t 
    WHERE t.wallet_id = w.id 
    AND t.type IN ('expense', 'transfer_out', 'debt_repayment')
  );