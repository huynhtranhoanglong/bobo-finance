-- ============================================================
-- NOTIFICATION HUB & FAMILY INVITE UPDATE (v1.3.4)
-- Date: 2026-01-16
-- Purpose: Implement in-app notifications and update invitation logic
-- ============================================================

-- ============ 1. CREATE NOTIFICATIONS TABLE ============

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'family_invite', 'system', etc.
    title TEXT NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}'::jsonb, -- Store extra data like family_id, invite_token
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 2. ENABLE RLS & POLICIES ============

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Policy: System functions (security definer) can insert, but let's allow users to insert if needed (optional)
-- generally notifications are system generated.

-- ============ 3. RPC FUNCTIONS FOR NOTIFICATIONS ============

-- 3.1 Get my notifications
CREATE OR REPLACE FUNCTION get_my_notifications()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(json_build_object(
        'id', n.id,
        'type', n.type,
        'title', n.title,
        'content', n.content,
        'data', n.data,
        'is_read', n.is_read,
        'created_at', n.created_at
    ) ORDER BY n.created_at DESC)
    INTO v_result
    FROM notifications n
    WHERE n.user_id = auth.uid();

    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============ 4. UPDATE FAMILY INVITATION LOGIC ============

-- 4.1 Update invite_family_member to create notification + Set 24h Expiry
CREATE OR REPLACE FUNCTION invite_family_member(p_email TEXT)
RETURNS UUID AS $$
DECLARE
    v_family_id UUID;
    v_family_name TEXT;
    v_invitation_id UUID;
    v_existing_user UUID;
    v_inviter_name TEXT;
    v_token TEXT;
BEGIN
    -- Check if user is owner
    SELECT id, name INTO v_family_id, v_family_name
    FROM families WHERE owner_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RAISE EXCEPTION 'Only family owner can invite members';
    END IF;
    
    -- Check if email is already a member
    SELECT u.id INTO v_existing_user
    FROM auth.users u
    JOIN family_members fm ON fm.user_id = u.id
    WHERE u.email = p_email AND fm.family_id = v_family_id;
    
    IF v_existing_user IS NOT NULL THEN
        RAISE EXCEPTION 'This person is already a member of your family';
    END IF;
    
    -- Check for pending invitation
    IF EXISTS (
        SELECT 1 FROM family_invitations 
        WHERE family_id = v_family_id 
        AND email = p_email 
        AND status = 'pending'
        AND expires_at > NOW()
    ) THEN
        RAISE EXCEPTION 'An invitation to this email is already pending';
    END IF;
    
    -- Generate token
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Create invitation with 24 hours expiry
    INSERT INTO family_invitations (family_id, email, invited_by, token, expires_at)
    VALUES (v_family_id, p_email, auth.uid(), v_token, NOW() + INTERVAL '24 hours')
    RETURNING id INTO v_invitation_id;

    -- Get Inviter Name for notification
    SELECT COALESCE(display_name, email) INTO v_inviter_name
    FROM profiles 
    WHERE id = auth.uid();
    
    IF v_inviter_name IS NULL THEN
        SELECT email INTO v_inviter_name FROM auth.users WHERE id = auth.uid();
    END IF;

    -- CHECK IF TARGET USER EXISTS -> CREATE NOTIFICATION
    -- We search in auth.users by email
    SELECT id INTO v_existing_user FROM auth.users WHERE email = p_email;

    IF v_existing_user IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, content, data)
        VALUES (
            v_existing_user,
            'family_invite',
            'Lời mời tham gia gia đình',
            v_inviter_name || ' đã mời bạn tham gia gia đình "' || v_family_name || '"',
            json_build_object(
                'family_id', v_family_id,
                'family_name', v_family_name,
                'invitation_id', v_invitation_id,
                'inviter_name', v_inviter_name,
                'token', v_token
            )::jsonb
        );
    END IF;
    
    RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============ 5. TRIGGER FOR NEW USER REGISTRATION ============

-- Function to handle new user registration and check for pending invites
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS trigger AS $$
DECLARE
    v_invite RECORD;
    v_family_name TEXT;
    v_inviter_name TEXT;
BEGIN
    -- Loop through all valid pending invitations for this email
    FOR v_invite IN 
        SELECT fi.*, f.name as family_name, 
               COALESCE(p.display_name, u_inviter.email) as inviter_name
        FROM family_invitations fi
        JOIN families f ON fi.family_id = f.id
        LEFT JOIN profiles p ON fi.invited_by = p.id
        LEFT JOIN auth.users u_inviter ON fi.invited_by = u_inviter.id
        WHERE fi.email = new.email 
        AND fi.status = 'pending'
        AND fi.expires_at > NOW()
    LOOP
        -- Create notification for the new user
        INSERT INTO public.notifications (user_id, type, title, content, data)
        VALUES (
            new.id,
            'family_invite',
            'Lời mời tham gia gia đình',
            v_invite.inviter_name || ' đã mời bạn tham gia gia đình "' || v_invite.family_name || '"',
            json_build_object(
                'family_id', v_invite.family_id,
                'family_name', v_invite.family_name,
                'invitation_id', v_invite.id,
                'inviter_name', v_invite.inviter_name,
                'token', v_invite.token
            )::jsonb
        );
    END LOOP;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_for_notifications ON auth.users;

CREATE TRIGGER on_auth_user_created_for_notifications
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notifications();

