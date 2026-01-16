-- ============================================================
-- FAMILY FEATURE - DATABASE SCHEMA (v1.3.0)
-- Date: 2026-01-16
-- Purpose: Create tables and columns for Family feature
-- ============================================================

-- ============ 1. CREATE NEW TABLES ============

-- 1.1. Families table
CREATE TABLE families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2. Family Members table
CREATE TABLE family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id) -- One user can only be in one family once
);

-- 1.3. Family Invitations table
CREATE TABLE family_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 2. ADD COLUMNS TO EXISTING TABLES ============

-- 2.1. Wallets: add family_id and visibility
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'shared' CHECK (visibility IN ('shared', 'private'));

-- 2.2. Funds: add family_id
ALTER TABLE funds 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;

-- 2.3. Debts: add family_id
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;

-- 2.4. Transactions: add family_id
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;

-- ============ 3. CREATE INDEXES FOR PERFORMANCE ============

CREATE INDEX IF NOT EXISTS idx_wallets_family_id ON wallets(family_id);
CREATE INDEX IF NOT EXISTS idx_funds_family_id ON funds(family_id);
CREATE INDEX IF NOT EXISTS idx_debts_family_id ON debts(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(token);

-- ============ 4. ENABLE ROW LEVEL SECURITY ============

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- ============ 5. RLS POLICIES FOR NEW TABLES ============

-- 5.1. Families policies
CREATE POLICY "Users can view their own family" ON families
    FOR SELECT USING (
        id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create families" ON families
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only owner can update family" ON families
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Only owner can delete family" ON families
    FOR DELETE USING (owner_id = auth.uid());

-- 5.2. Family Members policies
CREATE POLICY "Members can view their family members" ON family_members
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Owner can manage members" ON family_members
    FOR ALL USING (
        family_id IN (SELECT id FROM families WHERE owner_id = auth.uid())
    );

CREATE POLICY "Users can leave family" ON family_members
    FOR DELETE USING (user_id = auth.uid());

-- 5.3. Family Invitations policies  
CREATE POLICY "Anyone can view invitation by token" ON family_invitations
    FOR SELECT USING (true); -- Token acts as access control

CREATE POLICY "Owner can create invitations" ON family_invitations
    FOR INSERT WITH CHECK (
        family_id IN (SELECT id FROM families WHERE owner_id = auth.uid())
    );

CREATE POLICY "Owner can manage invitations" ON family_invitations
    FOR ALL USING (
        family_id IN (SELECT id FROM families WHERE owner_id = auth.uid())
    );

-- ============ 6. UPDATE RLS POLICIES FOR EXISTING TABLES ============
-- These policies allow family members to see shared data

-- 6.1. Update Wallets policies
DROP POLICY IF EXISTS "Enable access for owners" ON wallets;

CREATE POLICY "Users can view own and family wallets" ON wallets
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
            AND visibility = 'shared'
        )
    );

CREATE POLICY "Users can insert own wallets" ON wallets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wallets" ON wallets
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own wallets" ON wallets
    FOR DELETE USING (user_id = auth.uid());

-- 6.2. Update Funds policies
DROP POLICY IF EXISTS "Enable access for owners" ON funds;
DROP POLICY IF EXISTS "Users can view own data" ON funds;
DROP POLICY IF EXISTS "Users can insert own data" ON funds;
DROP POLICY IF EXISTS "Users can update own data" ON funds;
DROP POLICY IF EXISTS "Users can delete own data" ON funds;

CREATE POLICY "Users can view own and family funds" ON funds
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert own funds" ON funds
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own funds" ON funds
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own funds" ON funds
    FOR DELETE USING (user_id = auth.uid());

-- 6.3. Update Debts policies
DROP POLICY IF EXISTS "Enable access for owners" ON debts;

CREATE POLICY "Users can view own and family debts" ON debts
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert own debts" ON debts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own debts" ON debts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own debts" ON debts
    FOR DELETE USING (user_id = auth.uid());

-- 6.4. Update Transactions policies
DROP POLICY IF EXISTS "Enable access for owners" ON transactions;

CREATE POLICY "Users can view own and family transactions" ON transactions
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (
            family_id IS NOT NULL 
            AND family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (user_id = auth.uid());
