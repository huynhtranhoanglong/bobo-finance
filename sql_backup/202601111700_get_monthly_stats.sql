-- Hàm lấy thống kê chi tiêu Tháng hiện tại (v1.0.6)
-- Input: month (1-12), year (2026)
-- Output: JSON { income, expense, remaining, breakdown: { must_have, nice_to_have, waste }, min_spend, has_debt }

create or replace function get_monthly_stats(p_month int, p_year int)
returns json as $$
declare
  v_income decimal := 0;
  v_expense decimal := 0;
  v_must_have decimal := 0;
  v_nice_to_have decimal := 0;
  v_waste decimal := 0;
  v_min_spend decimal := 0;
  v_has_debt boolean := false;
  v_start_date timestamptz;
  v_end_date timestamptz;
begin
  -- Xây dựng khoản thời gian đầu tháng - cuối tháng
  v_start_date := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'Asia/Ho_Chi_Minh');
  v_end_date := v_start_date + interval '1 month';

  -- 1. Tính Tổng Income (Loại trừ Transfer)
  select coalesce(sum(amount), 0) into v_income
  from transactions
  where type = 'income'
  and date >= v_start_date and date < v_end_date
  and user_id = auth.uid();

  -- 2. Tính Tổng Expense (Loại trừ Transfer)
  select coalesce(sum(amount), 0) into v_expense
  from transactions
  where type = 'expense'
  and date >= v_start_date and date < v_end_date
  and user_id = auth.uid();

  -- 3. Tính Breakdown (Must Have, Nice to Have, Waste)
  select coalesce(sum(amount), 0) into v_must_have
  from transactions
  where type = 'expense' and category_level = 'must_have'
  and date >= v_start_date and date < v_end_date
  and user_id = auth.uid();

  select coalesce(sum(amount), 0) into v_nice_to_have
  from transactions
  where type = 'expense' and category_level = 'nice_to_have'
  and date >= v_start_date and date < v_end_date
  and user_id = auth.uid();

  select coalesce(sum(amount), 0) into v_waste
  from transactions
  where type = 'expense' and category_level = 'waste'
  and date >= v_start_date and date < v_end_date
  and user_id = auth.uid();

  -- 4. Tính Chi tiêu tối thiểu trung bình (90 ngày qua)
  -- Logic khớp với get_financial_metrics
  select coalesce(sum(amount), 0) / 3 into v_min_spend
  from transactions
  where type = 'expense'
  and category_level = 'must_have'
  and date > (now() - interval '90 days')
  and user_id = auth.uid();

  if v_min_spend is null then v_min_spend := 0; end if;

  -- 5. Kiểm tra có Nợ không
  if exists (select 1 from debts where type = 'payable' and remaining_amount > 0 and user_id = auth.uid()) then
    v_has_debt := true;
  end if;

  -- 6. Trả về JSON
  return json_build_object(
    'income', v_income,
    'expense', v_expense,
    'remaining', v_income - v_expense,
    'breakdown', json_build_object(
        'must_have', v_must_have,
        'nice_to_have', v_nice_to_have,
        'waste', v_waste
    ),
    'min_spend', v_min_spend,
    'has_debt', v_has_debt
  );

end;
$$ language plpgsql security definer;
