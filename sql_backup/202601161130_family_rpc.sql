-- ============================================================
-- FAMILY FEATURE - RPC FUNCTIONS (v1.3.0)
-- Date: 2026-01-16
-- Purpose: Create all RPC functions for Family management
-- ============================================================

-- ============ HELPER FUNCTIONS ============

-- Get user's family_id (returns NULL if not in any family)
CREATE OR REPLACE FUNCTION get_user_family_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT family_id 
        FROM family_members 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is owner of their family
CREATE OR REPLACE FUNCTION is_family_owner()
RETURNS BOOLEAN AS $$
DECLARE
    v_family_id UUID;
BEGIN
    SELECT family_id INTO v_family_id
    FROM family_members 
    WHERE user_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM families 
        WHERE id = v_family_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============ FAMILY MANAGEMENT ============

-- Create a new family (user becomes owner)
CREATE OR REPLACE FUNCTION create_family(p_name TEXT)
RETURNS UUID AS $$
DECLARE
    v_family_id UUID;
    v_existing_family UUID;
BEGIN
    -- Check if user is already in a family
    SELECT family_id INTO v_existing_family
    FROM family_members WHERE user_id = auth.uid();
    
    IF v_existing_family IS NOT NULL THEN
        RAISE EXCEPTION 'You are already in a family. Leave first before creating a new one.';
    END IF;
    
    -- Create family
    INSERT INTO families (name, owner_id)
    VALUES (p_name, auth.uid())
    RETURNING id INTO v_family_id;
    
    -- Add creator as owner member
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (v_family_id, auth.uid(), 'owner');
    
    -- Migrate user's existing data to family
    UPDATE wallets SET family_id = v_family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    UPDATE funds SET family_id = v_family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    UPDATE debts SET family_id = v_family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    UPDATE transactions SET family_id = v_family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    
    RETURN v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get current user's family info with members
CREATE OR REPLACE FUNCTION get_my_family()
RETURNS JSON AS $$
DECLARE
    v_family_id UUID;
    v_result JSON;
BEGIN
    SELECT family_id INTO v_family_id
    FROM family_members WHERE user_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    SELECT json_build_object(
        'id', f.id,
        'name', f.name,
        'owner_id', f.owner_id,
        'created_at', f.created_at,
        'is_owner', (f.owner_id = auth.uid()),
        'members', (
            SELECT json_agg(json_build_object(
                'user_id', fm.user_id,
                'role', fm.role,
                'joined_at', fm.joined_at,
                'email', p.email,
                'display_name', COALESCE(p.display_name, p.email)
            ))
            FROM family_members fm
            LEFT JOIN profiles p ON p.id = fm.user_id
            WHERE fm.family_id = f.id
        ),
        'pending_invitations', (
            SELECT json_agg(json_build_object(
                'id', fi.id,
                'email', fi.email,
                'created_at', fi.created_at,
                'expires_at', fi.expires_at
            ))
            FROM family_invitations fi
            WHERE fi.family_id = f.id AND fi.status = 'pending'
        )
    ) INTO v_result
    FROM families f
    WHERE f.id = v_family_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Update family name (owner only)
CREATE OR REPLACE FUNCTION update_family_name(p_name TEXT)
RETURNS VOID AS $$
DECLARE
    v_family_id UUID;
BEGIN
    SELECT family_id INTO v_family_id
    FROM family_members WHERE user_id = auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM families WHERE id = v_family_id AND owner_id = auth.uid()) THEN
        RAISE EXCEPTION 'Only family owner can update family name';
    END IF;
    
    UPDATE families SET name = p_name WHERE id = v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Leave family
CREATE OR REPLACE FUNCTION leave_family()
RETURNS VOID AS $$
DECLARE
    v_family_id UUID;
    v_is_owner BOOLEAN;
    v_member_count INT;
    v_new_owner UUID;
BEGIN
    SELECT fm.family_id, (f.owner_id = auth.uid())
    INTO v_family_id, v_is_owner
    FROM family_members fm
    JOIN families f ON f.id = fm.family_id
    WHERE fm.user_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RAISE EXCEPTION 'You are not in any family';
    END IF;
    
    -- Count remaining members
    SELECT COUNT(*) INTO v_member_count
    FROM family_members WHERE family_id = v_family_id;
    
    -- If owner is leaving
    IF v_is_owner THEN
        IF v_member_count = 1 THEN
            -- Last member, delete family
            DELETE FROM families WHERE id = v_family_id;
        ELSE
            -- Transfer ownership to next member
            SELECT user_id INTO v_new_owner
            FROM family_members 
            WHERE family_id = v_family_id AND user_id != auth.uid()
            ORDER BY joined_at ASC
            LIMIT 1;
            
            UPDATE families SET owner_id = v_new_owner WHERE id = v_family_id;
            UPDATE family_members SET role = 'owner' WHERE family_id = v_family_id AND user_id = v_new_owner;
        END IF;
    END IF;
    
    -- Remove user from family
    DELETE FROM family_members WHERE user_id = auth.uid();
    
    -- Unlink user's data from family
    UPDATE wallets SET family_id = NULL WHERE user_id = auth.uid();
    UPDATE funds SET family_id = NULL WHERE user_id = auth.uid();
    UPDATE debts SET family_id = NULL WHERE user_id = auth.uid();
    UPDATE transactions SET family_id = NULL WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Remove member from family (owner only)
CREATE OR REPLACE FUNCTION remove_family_member(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_family_id UUID;
BEGIN
    SELECT id INTO v_family_id
    FROM families WHERE owner_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RAISE EXCEPTION 'Only family owner can remove members';
    END IF;
    
    IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot remove yourself. Use leave_family instead.';
    END IF;
    
    -- Remove member
    DELETE FROM family_members 
    WHERE family_id = v_family_id AND user_id = p_user_id;
    
    -- Unlink their data from family
    UPDATE wallets SET family_id = NULL WHERE user_id = p_user_id AND family_id = v_family_id;
    UPDATE funds SET family_id = NULL WHERE user_id = p_user_id AND family_id = v_family_id;
    UPDATE debts SET family_id = NULL WHERE user_id = p_user_id AND family_id = v_family_id;
    UPDATE transactions SET family_id = NULL WHERE user_id = p_user_id AND family_id = v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============ INVITATION MANAGEMENT ============

-- Invite a new member by email (owner only)  
CREATE OR REPLACE FUNCTION invite_family_member(p_email TEXT)
RETURNS UUID AS $$
DECLARE
    v_family_id UUID;
    v_invitation_id UUID;
    v_existing_user UUID;
BEGIN
    -- Check if user is owner
    SELECT id INTO v_family_id
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
    
    -- Create invitation
    INSERT INTO family_invitations (family_id, email, invited_by)
    VALUES (v_family_id, p_email, auth.uid())
    RETURNING id INTO v_invitation_id;
    
    RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get invitation info by token (public - for invitation page)
CREATE OR REPLACE FUNCTION get_invitation_info(p_token TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'id', fi.id,
        'family_name', f.name,
        'invited_by_name', COALESCE(p.display_name, p.email),
        'email', fi.email,
        'status', fi.status,
        'expires_at', fi.expires_at,
        'is_expired', (fi.expires_at < NOW() OR fi.status != 'pending')
    ) INTO v_result
    FROM family_invitations fi
    JOIN families f ON f.id = fi.family_id
    LEFT JOIN profiles p ON p.id = fi.invited_by
    WHERE fi.token = p_token;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(p_token TEXT)
RETURNS UUID AS $$
DECLARE
    v_invitation RECORD;
    v_user_email TEXT;
    v_existing_family UUID;
BEGIN
    -- Get invitation
    SELECT * INTO v_invitation
    FROM family_invitations
    WHERE token = p_token;
    
    IF v_invitation IS NULL THEN
        RAISE EXCEPTION 'Invitation not found';
    END IF;
    
    IF v_invitation.status != 'pending' THEN
        RAISE EXCEPTION 'This invitation is no longer valid';
    END IF;
    
    IF v_invitation.expires_at < NOW() THEN
        UPDATE family_invitations SET status = 'expired' WHERE id = v_invitation.id;
        RAISE EXCEPTION 'This invitation has expired';
    END IF;
    
    -- Check user email matches invitation
    SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
    
    IF v_user_email != v_invitation.email THEN
        RAISE EXCEPTION 'This invitation was sent to a different email address';
    END IF;
    
    -- Check if user is already in a family
    SELECT family_id INTO v_existing_family
    FROM family_members WHERE user_id = auth.uid();
    
    IF v_existing_family IS NOT NULL THEN
        RAISE EXCEPTION 'You are already in a family. Leave first before joining another.';
    END IF;
    
    -- Add user as member
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (v_invitation.family_id, auth.uid(), 'member');
    
    -- Update invitation status
    UPDATE family_invitations SET status = 'accepted' WHERE id = v_invitation.id;
    
    -- Migrate user's existing data to family
    UPDATE wallets SET family_id = v_invitation.family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    UPDATE funds SET family_id = v_invitation.family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    UPDATE debts SET family_id = v_invitation.family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    UPDATE transactions SET family_id = v_invitation.family_id WHERE user_id = auth.uid() AND family_id IS NULL;
    
    RETURN v_invitation.family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Cancel invitation (owner only)
CREATE OR REPLACE FUNCTION cancel_invitation(p_invitation_id UUID)
RETURNS VOID AS $$
DECLARE
    v_family_id UUID;
BEGIN
    SELECT id INTO v_family_id
    FROM families WHERE owner_id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RAISE EXCEPTION 'Only family owner can cancel invitations';
    END IF;
    
    UPDATE family_invitations 
    SET status = 'cancelled'
    WHERE id = p_invitation_id AND family_id = v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============ UPDATED HELPER FOR EXISTING FUNCTIONS ============

-- Auto-attach family_id when creating new data
-- This should be called in existing RPC functions

CREATE OR REPLACE FUNCTION attach_user_family_id()
RETURNS UUID AS $$
BEGIN
    RETURN get_user_family_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
