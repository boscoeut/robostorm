-- Setup script for user roles system
-- Run this in your Supabase SQL Editor

-- Create user_roles table to store user role assignments
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id); 
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;

-- RLS Policies
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert roles" ON user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update roles" ON user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_roles 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set user role (admin only)
CREATE OR REPLACE FUNCTION set_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- Check if current user is admin
    SELECT role INTO current_user_role
    FROM user_roles 
    WHERE user_id = auth.uid();
    
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can set user roles';
    END IF;
    
    -- Insert or update the role
    INSERT INTO user_roles (user_id, role, created_by)
    VALUES (target_user_id, new_role, auth.uid())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = new_role,
        updated_at = NOW(),
        created_by = auth.uid();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Trigger to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert admin role for the existing admin user (based on the hardcoded ID in AuthContext)
-- Replace this UUID with your actual admin user ID
INSERT INTO user_roles (user_id, role, created_by) 
VALUES ('18e1814c-67e4-4e92-9a97-300dfc8082df', 'admin', '18e1814c-67e4-4e92-9a97-300dfc8082df')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Optional: Add roles for any existing users (they will get 'user' role by default)
-- This handles existing users who were created before the trigger was set up
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

