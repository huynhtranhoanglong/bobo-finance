-- Gộp tất cả API Dashboard thành 1 RPC (v1.2.4)
-- Date: 2026-01-15
-- Purpose: Giảm số lượng request từ 5 xuống 1

create or replace function get_dashboard_data(p_month int, p_year int)
returns json as $$
declare
    -- Financial metrics variables
    v_min_spend decimal;
    v_std_spend decimal;
    v_total_assets decimal;
    v_total_debts decimal;
    v_net_worth decimal;
    v_safety_target decimal;
    v_freedom_target decimal;
    
    -- Monthly stats variables
    v_income decimal := 0;
    v_expense decimal := 0;
    v_must_have decimal := 0;
    v_nice_to_have decimal := 0;
    v_waste decimal := 0;
    v_has_debt boolean := false;
    v_start_date timestamptz;
    v_end_date timestamptz;
    
    -- Result variables
    v_wallets json;
    v_debts json;
    v_funds json;
begin
    -- ============ FINANCIAL METRICS ============
    
    -- 1. Tính Chi tiêu Tối thiểu (90 ngày)
    select coalesce(sum(amount), 0) / 3 into v_min_spend
    from transactions
    where type = 'expense'
    and category_level = 'must_have'
    and date > (now() - interval '90 days')
    and user_id = auth.uid();

    -- 2. Tính Chi tiêu Tiêu chuẩn
    select coalesce(sum(amount), 0) / 3 into v_std_spend
    from transactions
    where type = 'expense'
    and category_level in ('must_have', 'nice_to_have')
    and date > (now() - interval '90 days')
    and user_id = auth.uid();

    -- 3. Tính Tổng tài sản
    select coalesce(sum(balance), 0) into v_total_assets 
    from wallets
    where user_id = auth.uid();
    
    -- 4. Tính Tổng nợ phải trả
    select coalesce(sum(remaining_amount), 0) into v_total_debts
    from debts
    where type = 'payable' and remaining_amount > 0 and user_id = auth.uid();
    
    -- 5. Net Worth = Tài sản - Nợ
    v_net_worth := v_total_assets - v_total_debts;

    -- 6. Tính Mục tiêu
    if v_min_spend = 0 then v_min_spend := 1; end if;
    if v_std_spend = 0 then v_std_spend := 1; end if;
    v_safety_target := v_min_spend * 12 * 25;
    v_freedom_target := v_std_spend * 12 * 25;

    -- ============ MONTHLY STATS ============
    
    v_start_date := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'Asia/Ho_Chi_Minh');
    v_end_date := v_start_date + interval '1 month';

    -- Income
    select coalesce(sum(amount), 0) into v_income
    from transactions
    where type = 'income'
    and date >= v_start_date and date < v_end_date
    and user_id = auth.uid();

    -- Expense
    select coalesce(sum(amount), 0) into v_expense
    from transactions
    where type = 'expense'
    and date >= v_start_date and date < v_end_date
    and user_id = auth.uid();

    -- Breakdown
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

    -- Check debt status
    if exists (select 1 from debts where type = 'payable' and remaining_amount > 0 and user_id = auth.uid()) then
        v_has_debt := true;
    end if;

    -- ============ WALLETS ============
    select json_agg(row_to_json(w)) into v_wallets
    from (
        select 
            w.id, w.name, w.balance, w.fund_id,
            json_build_object('id', f.id, 'name', f.name) as funds
        from wallets w
        left join funds f on w.fund_id = f.id
        where w.user_id = auth.uid()
        order by w.balance desc
    ) w;
    
    -- ============ DEBTS (payable only) ============
    select json_agg(row_to_json(d)) into v_debts
    from (
        select id, name, remaining_amount, total_amount
        from debts
        where type = 'payable' and remaining_amount > 0 and user_id = auth.uid()
        order by remaining_amount desc
    ) d;
    
    -- ============ FUNDS ============
    select json_agg(row_to_json(f)) into v_funds
    from (
        select id, name from funds where user_id = auth.uid()
    ) f;

    -- ============ RETURN COMBINED RESULT ============
    return json_build_object(
        'metrics', json_build_object(
            'net_worth', v_net_worth,
            'total_assets', v_total_assets,
            'total_debts', v_total_debts,
            'min_monthly_spend', v_min_spend,
            'std_monthly_spend', v_std_spend,
            'safety_target', v_safety_target,
            'freedom_target', v_freedom_target,
            'safety_progress', (v_net_worth / v_safety_target) * 100,
            'freedom_progress', (v_net_worth / v_freedom_target) * 100
        ),
        'monthly_stats', json_build_object(
            'income', v_income,
            'expense', v_expense,
            'remaining', v_income - v_expense,
            'breakdown', json_build_object(
                'must_have', v_must_have,
                'nice_to_have', v_nice_to_have,
                'waste', v_waste
            ),
            'min_spend', v_min_spend,
            'std_spend', v_std_spend,
            'has_debt', v_has_debt
        ),
        'wallets', coalesce(v_wallets, '[]'::json),
        'debts', coalesce(v_debts, '[]'::json),
        'funds', coalesce(v_funds, '[]'::json)
    );
end;
$$ language plpgsql security definer;
