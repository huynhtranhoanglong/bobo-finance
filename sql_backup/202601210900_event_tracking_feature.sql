-- ============================================================
-- EVENT TRACKING FEATURE (v1.6.0)
-- Date: 2026-01-21
-- Purpose: 
--   1. Create events table
--   2. Add event_id to transactions table
--   3. Create RPC functions for event management
-- ============================================================

-- ============ 1. CREATE EVENTS TABLE ============

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    budget DECIMAL,                    -- NULL = no budget set
    start_date DATE,                   -- Optional
    end_date DATE,                     -- Optional
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    visibility TEXT DEFAULT 'shared' CHECK (visibility IN ('shared', 'private')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 2. ADD EVENT_ID TO TRANSACTIONS ============

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- ============ 3. CREATE INDEXES ============

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);

-- ============ 4. ENABLE RLS ============

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============ 5. RLS POLICIES FOR EVENTS ============

-- Users can view own events and family shared events
CREATE POLICY "Users can view own and family events" ON events
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
            AND visibility = 'shared'
        )
    );

CREATE POLICY "Users can insert own events" ON events
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (user_id = auth.uid());

-- ============ 6. RPC FUNCTIONS ============

-- 6.1. CREATE EVENT
CREATE OR REPLACE FUNCTION create_event(
    p_name TEXT,
    p_budget DECIMAL DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_visibility TEXT DEFAULT 'shared'
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_family_id UUID;
    v_actual_visibility TEXT;
BEGIN
    v_family_id := get_user_family_id();
    
    -- If no family, always use 'shared' (no distinction needed)
    IF v_family_id IS NULL THEN
        v_actual_visibility := 'shared';
    ELSE
        v_actual_visibility := p_visibility;
    END IF;
    
    -- Validate visibility
    IF v_actual_visibility NOT IN ('shared', 'private') THEN
        v_actual_visibility := 'shared';
    END IF;
    
    INSERT INTO events (user_id, family_id, name, budget, start_date, end_date, visibility)
    VALUES (auth.uid(), v_family_id, p_name, p_budget, p_start_date, p_end_date, v_actual_visibility)
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2. GET EVENTS LIST
CREATE OR REPLACE FUNCTION get_events_list()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_events JSONB := '[]'::jsonb;
BEGIN
    v_user_id := auth.uid();
    v_family_id := get_user_family_id();
    
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', e.id,
            'name', e.name,
            'budget', e.budget,
            'start_date', e.start_date,
            'end_date', e.end_date,
            'status', e.status,
            'visibility', e.visibility,
            'created_at', e.created_at,
            'owner_id', e.user_id,
            'total_spent', COALESCE(t.total_spent, 0),
            'transaction_count', COALESCE(t.tx_count, 0)
        ) ORDER BY 
            CASE WHEN e.status = 'active' THEN 0 ELSE 1 END,
            e.created_at DESC
    ), '[]'::jsonb) INTO v_events
    FROM events e
    LEFT JOIN (
        SELECT event_id, 
               SUM(amount) as total_spent, 
               COUNT(*) as tx_count
        FROM transactions 
        WHERE event_id IS NOT NULL
        GROUP BY event_id
    ) t ON e.id = t.event_id
    WHERE (
        (v_family_id IS NOT NULL AND e.family_id = v_family_id AND e.visibility = 'shared')
        OR (v_family_id IS NOT NULL AND e.user_id = v_user_id) -- own events in family
        OR (v_family_id IS NULL AND e.user_id = v_user_id)
    );
    
    RETURN v_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6.3. GET EVENT DETAIL
CREATE OR REPLACE FUNCTION get_event_detail(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_event JSONB;
    v_transactions JSONB;
    v_breakdown JSONB;
BEGIN
    v_user_id := auth.uid();
    v_family_id := get_user_family_id();
    
    -- Get event info
    SELECT jsonb_build_object(
        'id', e.id,
        'name', e.name,
        'budget', e.budget,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'status', e.status,
        'visibility', e.visibility,
        'created_at', e.created_at,
        'owner_id', e.user_id,
        'is_owner', e.user_id = v_user_id
    ) INTO v_event
    FROM events e
    WHERE e.id = p_event_id
    AND (
        (v_family_id IS NOT NULL AND e.family_id = v_family_id AND e.visibility = 'shared')
        OR e.user_id = v_user_id
    );
    
    IF v_event IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get transactions belonging to this event
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', t.id,
            'amount', t.amount,
            'type', t.type,
            'category_level', t.category_level,
            'note', t.note,
            'date', t.date,
            'wallet_id', t.wallet_id,
            'wallet_name', w.name
        ) ORDER BY t.date DESC
    ), '[]'::jsonb) INTO v_transactions
    FROM transactions t
    LEFT JOIN wallets w ON t.wallet_id = w.id
    WHERE t.event_id = p_event_id;
    
    -- Get breakdown by category
    SELECT jsonb_build_object(
        'must_have', COALESCE(SUM(CASE WHEN category_level = 'must_have' THEN amount ELSE 0 END), 0),
        'nice_to_have', COALESCE(SUM(CASE WHEN category_level = 'nice_to_have' THEN amount ELSE 0 END), 0),
        'waste', COALESCE(SUM(CASE WHEN category_level = 'waste' THEN amount ELSE 0 END), 0),
        'other', COALESCE(SUM(CASE WHEN category_level = 'other_expense' THEN amount ELSE 0 END), 0),
        'total', COALESCE(SUM(amount), 0)
    ) INTO v_breakdown
    FROM transactions
    WHERE event_id = p_event_id;
    
    -- Combine and return
    RETURN v_event || jsonb_build_object(
        'transactions', v_transactions,
        'breakdown', v_breakdown
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6.4. UPDATE EVENT
CREATE OR REPLACE FUNCTION update_event(
    p_event_id UUID,
    p_name TEXT,
    p_budget DECIMAL DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE events
    SET name = p_name,
        budget = p_budget,
        start_date = p_start_date,
        end_date = p_end_date
    WHERE id = p_event_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.5. COMPLETE EVENT
CREATE OR REPLACE FUNCTION complete_event(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events
    SET status = 'completed'
    WHERE id = p_event_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.6. REOPEN EVENT (set back to active)
CREATE OR REPLACE FUNCTION reopen_event(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events
    SET status = 'active'
    WHERE id = p_event_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.7. DELETE EVENT (keeps transactions, just removes link)
CREATE OR REPLACE FUNCTION delete_event(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
    -- First, unlink all transactions from this event
    UPDATE transactions
    SET event_id = NULL
    WHERE event_id = p_event_id;
    
    -- Then delete the event
    DELETE FROM events
    WHERE id = p_event_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.8. GET ACTIVE EVENTS (for dropdown in Add Transaction)
CREATE OR REPLACE FUNCTION get_active_events()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_events JSONB := '[]'::jsonb;
BEGIN
    v_user_id := auth.uid();
    v_family_id := get_user_family_id();
    
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', e.id,
            'name', e.name
        ) ORDER BY e.created_at DESC
    ), '[]'::jsonb) INTO v_events
    FROM events e
    WHERE e.status = 'active'
    AND (
        (v_family_id IS NOT NULL AND e.family_id = v_family_id AND e.visibility = 'shared')
        OR e.user_id = v_user_id
    );
    
    RETURN v_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6.9. GET DASHBOARD EVENTS (quick view for dashboard)
CREATE OR REPLACE FUNCTION get_dashboard_events()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_events JSONB := '[]'::jsonb;
BEGIN
    v_user_id := auth.uid();
    v_family_id := get_user_family_id();
    
    -- Get up to 3 active events with total spent
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', e.id,
            'name', e.name,
            'budget', e.budget,
            'total_spent', COALESCE(t.total_spent, 0)
        ) ORDER BY e.created_at DESC
    ), '[]'::jsonb) INTO v_events
    FROM (
        SELECT * FROM events
        WHERE status = 'active'
        AND (
            (v_family_id IS NOT NULL AND family_id = v_family_id AND visibility = 'shared')
            OR user_id = v_user_id
        )
        ORDER BY created_at DESC
        LIMIT 3
    ) e
    LEFT JOIN (
        SELECT event_id, SUM(amount) as total_spent
        FROM transactions 
        WHERE event_id IS NOT NULL
        GROUP BY event_id
    ) t ON e.id = t.event_id;
    
    RETURN v_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============ 7. GRANT PERMISSIONS ============

GRANT EXECUTE ON FUNCTION create_event(TEXT, DECIMAL, DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_events_list() TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_event(UUID, TEXT, DECIMAL, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reopen_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_events() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_events() TO authenticated;
