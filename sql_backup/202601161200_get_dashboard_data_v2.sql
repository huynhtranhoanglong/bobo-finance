-- ============================================================
-- FAMILY FEATURE - GET DASHBOARD DATA V2 (v1.3.1)
-- Date: 2026-01-16
-- Purpose: Update get_dashboard_data to support family data
-- ============================================================

-- Replace the get_dashboard_data function with family-aware version
create or replace function get_dashboard_data(p_month int, p_year int)
returns json as $$
declare
    -- Family context
    v_family_id uuid;
    
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
    v_family_info json;
begin
    -- ============ GET FAMILY CONTEXT ============
    -- If user has a family, use family_id for queries
    -- If not, fall back to user_id (personal data)
    v_family_id := get_user_family_id();

    -- ============ FINANCIAL METRICS ============
    
    -- 1. Tính Chi tiêu Tối thiểu (90 ngày)
    if v_family_id is not null then
        select coalesce(sum(amount), 0) / 3 into v_min_spend
        from transactions
        where type = 'expense'
        and category_level = 'must_have'
        and date > (now() - interval '90 days')
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) / 3 into v_min_spend
        from transactions
        where type = 'expense'
        and category_level = 'must_have'
        and date > (now() - interval '90 days')
        and user_id = auth.uid();
    end if;

    -- 2. Tính Chi tiêu Tiêu chuẩn
    if v_family_id is not null then
        select coalesce(sum(amount), 0) / 3 into v_std_spend
        from transactions
        where type = 'expense'
        and category_level in ('must_have', 'nice_to_have')
        and date > (now() - interval '90 days')
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) / 3 into v_std_spend
        from transactions
        where type = 'expense'
        and category_level in ('must_have', 'nice_to_have')
        and date > (now() - interval '90 days')
        and user_id = auth.uid();
    end if;

    -- 3. Tính Tổng tài sản
    if v_family_id is not null then
        select coalesce(sum(balance), 0) into v_total_assets 
        from wallets
        where family_id = v_family_id and visibility = 'shared';
    else
        select coalesce(sum(balance), 0) into v_total_assets 
        from wallets
        where user_id = auth.uid();
    end if;
    
    -- 4. Tính Tổng nợ phải trả
    if v_family_id is not null then
        select coalesce(sum(remaining_amount), 0) into v_total_debts
        from debts
        where type = 'payable' and remaining_amount > 0 and family_id = v_family_id;
    else
        select coalesce(sum(remaining_amount), 0) into v_total_debts
        from debts
        where type = 'payable' and remaining_amount > 0 and user_id = auth.uid();
    end if;
    
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
    if v_family_id is not null then
        select coalesce(sum(amount), 0) into v_income
        from transactions
        where type = 'income'
        and date >= v_start_date and date < v_end_date
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) into v_income
        from transactions
        where type = 'income'
        and date >= v_start_date and date < v_end_date
        and user_id = auth.uid();
    end if;

    -- Expense
    if v_family_id is not null then
        select coalesce(sum(amount), 0) into v_expense
        from transactions
        where type = 'expense'
        and date >= v_start_date and date < v_end_date
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) into v_expense
        from transactions
        where type = 'expense'
        and date >= v_start_date and date < v_end_date
        and user_id = auth.uid();
    end if;

    -- Breakdown: Must Have
    if v_family_id is not null then
        select coalesce(sum(amount), 0) into v_must_have
        from transactions
        where type = 'expense' and category_level = 'must_have'
        and date >= v_start_date and date < v_end_date
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) into v_must_have
        from transactions
        where type = 'expense' and category_level = 'must_have'
        and date >= v_start_date and date < v_end_date
        and user_id = auth.uid();
    end if;

    -- Breakdown: Nice to Have
    if v_family_id is not null then
        select coalesce(sum(amount), 0) into v_nice_to_have
        from transactions
        where type = 'expense' and category_level = 'nice_to_have'
        and date >= v_start_date and date < v_end_date
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) into v_nice_to_have
        from transactions
        where type = 'expense' and category_level = 'nice_to_have'
        and date >= v_start_date and date < v_end_date
        and user_id = auth.uid();
    end if;

    -- Breakdown: Waste
    if v_family_id is not null then
        select coalesce(sum(amount), 0) into v_waste
        from transactions
        where type = 'expense' and category_level = 'waste'
        and date >= v_start_date and date < v_end_date
        and family_id = v_family_id;
    else
        select coalesce(sum(amount), 0) into v_waste
        from transactions
        where type = 'expense' and category_level = 'waste'
        and date >= v_start_date and date < v_end_date
        and user_id = auth.uid();
    end if;

    -- Check debt status
    if v_family_id is not null then
        if exists (select 1 from debts where type = 'payable' and remaining_amount > 0 and family_id = v_family_id) then
            v_has_debt := true;
        end if;
    else
        if exists (select 1 from debts where type = 'payable' and remaining_amount > 0 and user_id = auth.uid()) then
            v_has_debt := true;
        end if;
    end if;

    -- ============ WALLETS ============
    if v_family_id is not null then
        select json_agg(row_to_json(w)) into v_wallets
        from (
            select 
                w.id, w.name, w.balance, w.fund_id, w.user_id,
                json_build_object('id', f.id, 'name', f.name) as funds,
                p.display_name as owner_name
            from wallets w
            left join funds f on w.fund_id = f.id
            left join profiles p on w.user_id = p.id
            where w.family_id = v_family_id and w.visibility = 'shared'
            order by w.balance desc
        ) w;
    else
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
    end if;
    
    -- ============ DEBTS ============
    if v_family_id is not null then
        select json_agg(row_to_json(d)) into v_debts
        from (
            select d.id, d.name, d.remaining_amount, d.total_amount, d.type, d.interest_level, d.user_id,
                   p.display_name as owner_name
            from debts d
            left join profiles p on d.user_id = p.id
            where d.remaining_amount > 0 and d.family_id = v_family_id
            order by 
                case when d.type = 'payable' then 1 else 2 end,
                case 
                    when d.type = 'payable' then 
                        case d.interest_level 
                            when 'high' then 1 
                            when 'medium' then 2 
                            when 'low' then 3 
                            else 4 
                        end
                    else 0 
                end,
                case when d.type = 'payable' then d.remaining_amount else null end asc,
                case when d.type = 'receivable' then d.remaining_amount else null end desc
        ) d;
    else
        select json_agg(row_to_json(d)) into v_debts
        from (
            select id, name, remaining_amount, total_amount, type, interest_level
            from debts
            where remaining_amount > 0 and user_id = auth.uid()
            order by 
                case when type = 'payable' then 1 else 2 end,
                case 
                    when type = 'payable' then 
                        case interest_level 
                            when 'high' then 1 
                            when 'medium' then 2 
                            when 'low' then 3 
                            else 4 
                        end
                    else 0 
                end,
                case when type = 'payable' then remaining_amount else null end asc,
                case when type = 'receivable' then remaining_amount else null end desc
        ) d;
    end if;
    
    -- ============ FUNDS ============
    if v_family_id is not null then
        select json_agg(row_to_json(f)) into v_funds
        from (
            select id, name from funds where family_id = v_family_id
        ) f;
    else
        select json_agg(row_to_json(f)) into v_funds
        from (
            select id, name from funds where user_id = auth.uid()
        ) f;
    end if;

    -- ============ FAMILY INFO (if applicable) ============
    if v_family_id is not null then
        select json_build_object(
            'id', f.id,
            'name', f.name,
            'is_owner', (f.owner_id = auth.uid()),
            'member_count', (select count(*) from family_members where family_id = f.id)
        ) into v_family_info
        from families f
        where f.id = v_family_id;
    else
        v_family_info := null;
    end if;

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
        'funds', coalesce(v_funds, '[]'::json),
        'family', v_family_info
    );
end;
$$ language plpgsql security definer;
