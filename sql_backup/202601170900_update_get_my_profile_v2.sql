-- ============================================================
-- UPDATE GET MY PROFILE V2 (v1.3.17)
-- Date: 2026-01-17
-- Purpose: Remove email fallback for display_name to handle greeting logic properly
-- ============================================================

-- 1. Update get_my_profile
-- OLD: COALESCE(p.display_name, u.email)
-- NEW: p.display_name (Can be NULL)

CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS JSON AS $$
DECLARE
    v_profile JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'email', u.email,
        'display_name', p.display_name, -- REMOVED Fallback to email
        'avatar_url', p.avatar_url,
        'created_at', p.created_at
    ) INTO v_profile
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE u.id = auth.uid();

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
