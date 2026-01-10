-- Cập nhật dư nợ còn lại (Remaining Amount)
UPDATE debts d
SET remaining_amount = d.remaining_amount 
  - (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions t 
    WHERE t.related_debt_id = d.id 
    AND t.type = 'debt_repayment'
  );