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
  -- Chỉ lấy category 'must_have'
  select coalesce(sum(amount), 0) / 3 into min_spend
  from transactions
  where type = 'expense'
  and category_level = 'must_have'
  and date > (now() - interval '90 days');

  -- 2. Tính Chi tiêu Tiêu chuẩn (Must have + Nice to have)
  select coalesce(sum(amount), 0) / 3 into std_spend
  from transactions
  where type = 'expense'
  and category_level in ('must_have', 'nice_to_have')
  and date > (now() - interval '90 days');

  -- 3. Tính Tổng tài sản (Net Worth) - Tổng tiền trong các ví
  select coalesce(sum(balance), 0) into total_assets from wallets;

  -- 4. Tính Mục tiêu (Công thức 25 năm)
  -- Nếu chưa có dữ liệu chi tiêu, đặt mục tiêu tạm là 1 tỷ để tránh lỗi chia cho 0
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