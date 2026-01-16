-- ============================================================
-- HOTFIX - NOTIFICATION HUB (v1.3.5)
-- Date: 2026-01-16
-- Purpose: Fix "column display_name does not exist" error in RPCs
-- ============================================================

-- 1. FIX invite_family_member RPC
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

    -- Get Inviter Name for notification (FIX: Use auth.users email)
    SELECT email INTO v_inviter_name
    FROM auth.users 
    WHERE id = auth.uid();

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


-- 2. FIX handle_new_user_notifications TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS trigger AS $$
DECLARE
    v_invite RECORD;
    v_family_name TEXT;
    v_inviter_name TEXT;
BEGIN
    -- Loop through all valid pending invitations for this email
    -- FIX: Removed join to profiles, used auth.users for inviter email
    FOR v_invite IN 
        SELECT fi.*, f.name as family_name, 
               u_inviter.email as inviter_name
        FROM family_invitations fi
        JOIN families f ON fi.family_id = f.id
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
