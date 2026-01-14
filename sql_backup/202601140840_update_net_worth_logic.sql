-- VERSION: v1.1.5
-- DATE: 2026-01-14
-- FEATURE: Update Net Worth Calculation (Assets - Debts)

create or replace function get_financial_metrics()
returns json as $$
declare
  min_spend decimal;
  std_spend decimal;
  total_assets decimal;
  total_debts decimal; -- NEW: Biến lưu tổng nợ
  safety_target decimal;
  freedom_target decimal;
begin
  -- 1. Tính Chi tiêu Tối thiểu (Trung bình 1 tháng dựa trên 90 ngày gần nhất)
  select coalesce(sum(amount), 0) / 3 into min_spend
  from transactions
  where type = 'expense'
  and category_level = 'must_have'
  and date > (now() - interval '90 days')
  and user_id = auth.uid();

  -- 2. Tính Chi tiêu Tiêu chuẩn (Must have + Nice to have)
  select coalesce(sum(amount), 0) / 3 into std_spend
  from transactions
  where type = 'expense'
  and category_level in ('must_have', 'nice_to_have')
  and date > (now() - interval '90 days')
  and user_id = auth.uid();

  -- 3. Tính Tổng tài sản (Assets) - Tổng tiền trong các ví
  select coalesce(sum(balance), 0) into total_assets 
  from wallets
  where user_id = auth.uid();

  -- 4. NEW: Tính Tổng dư nợ (Debts) - Chỉ tính khoản mình nợ (payable)
  select coalesce(sum(remaining_amount), 0) into total_debts
  from debts
  where type = 'payable'
  and user_id = auth.uid();

  -- 5. Tính Mục tiêu (Công thức 25 năm)
  if min_spend = 0 then min_spend := 1; end if;
  if std_spend = 0 then std_spend := 1; end if;

  safety_target := min_spend * 12 * 25;
  freedom_target := std_spend * 12 * 25;

  -- 6. Trả về kết quả dạng JSON
  -- Net Worth = Total Assets - Total Debts
  return json_build_object(
    'net_worth', total_assets - total_debts,
    'total_assets', total_assets, -- Optional: Trả thêm nếu FE cần hiện chi tiết
    'total_debts', total_debts,   -- Optional
    'min_monthly_spend', min_spend,
    'std_monthly_spend', std_spend,
    'safety_target', safety_target,
    'freedom_target', freedom_target,
    'safety_progress', ((total_assets - total_debts) / safety_target) * 100, -- Cập nhật progress theo Net Worth thực
    'freedom_progress', ((total_assets - total_debts) / freedom_target) * 100
  );
end;
$$ language plpgsql security definer;
