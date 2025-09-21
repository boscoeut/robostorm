-- Migration: Create Row Level Security Policies
-- Description: Implements comprehensive RLS policies for the robot database
-- Dependencies: Requires 001_create_user_roles.sql and 002_create_robot_database_tables.sql
-- Author: RoboStorm Development Team
-- Date: 2025-09-21

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_robot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_search_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MANUFACTURERS TABLE POLICIES
-- ============================================================================

-- Public read access to active manufacturers
CREATE POLICY "Public manufacturers are viewable by everyone" ON manufacturers
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all manufacturers
CREATE POLICY "Authenticated users can view all manufacturers" ON manufacturers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and moderators can create manufacturers
CREATE POLICY "Admins and moderators can create manufacturers" ON manufacturers
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Admins and moderators can update manufacturers
CREATE POLICY "Admins and moderators can update manufacturers" ON manufacturers
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete manufacturers
CREATE POLICY "Only admins can delete manufacturers" ON manufacturers
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- ROBOT CATEGORIES TABLE POLICIES
-- ============================================================================

-- Public read access to active categories
CREATE POLICY "Public robot categories are viewable by everyone" ON robot_categories
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all categories
CREATE POLICY "Authenticated users can view all robot categories" ON robot_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins and moderators can create categories
CREATE POLICY "Admins and moderators can create robot categories" ON robot_categories
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Admins and moderators can update categories
CREATE POLICY "Admins and moderators can update robot categories" ON robot_categories
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Only admins can delete categories
CREATE POLICY "Only admins can delete robot categories" ON robot_categories
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- ROBOTS TABLE POLICIES
-- ============================================================================

-- Public read access to active robots
CREATE POLICY "Public robots are viewable by everyone" ON robots
    FOR SELECT USING (status IN ('active', 'discontinued'));

-- Authenticated users can view all robots including prototypes
CREATE POLICY "Authenticated users can view all robots" ON robots
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        status IN ('active', 'discontinued')
    );

-- Contributors, moderators, and admins can create robots
CREATE POLICY "Contributors can create robots" ON robots
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator', 'contributor')
        )
    );

-- Users can update robots they created, moderators and admins can update any
CREATE POLICY "Users can update their own robots, moderators can update any" ON robots
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- Only admins can delete robots
CREATE POLICY "Only admins can delete robots" ON robots
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- ROBOT CATEGORY MAPPINGS TABLE POLICIES
-- ============================================================================

-- Public read access to category mappings
CREATE POLICY "Public robot category mappings are viewable by everyone" ON robot_category_mappings
    FOR SELECT USING (true);

-- Contributors, moderators, and admins can create mappings
CREATE POLICY "Contributors can create robot category mappings" ON robot_category_mappings
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator', 'contributor')
        )
    );

-- Contributors can update mappings for robots they created, moderators can update any
CREATE POLICY "Contributors can update their robot category mappings" ON robot_category_mappings
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM robots r 
                WHERE r.id = robot_id AND r.created_by = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- Contributors can delete mappings for robots they created, moderators can delete any
CREATE POLICY "Contributors can delete their robot category mappings" ON robot_category_mappings
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM robots r 
                WHERE r.id = robot_id AND r.created_by = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- ============================================================================
-- ROBOT SPECIFICATIONS TABLE POLICIES
-- ============================================================================

-- Public read access to verified specifications
CREATE POLICY "Public robot specifications are viewable by everyone" ON robot_specifications
    FOR SELECT USING (is_verified = true);

-- Authenticated users can view all specifications
CREATE POLICY "Authenticated users can view all robot specifications" ON robot_specifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Contributors, moderators, and admins can create specifications
CREATE POLICY "Contributors can create robot specifications" ON robot_specifications
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator', 'contributor')
        )
    );

-- Users can update specifications they created, moderators can update any
CREATE POLICY "Contributors can update their robot specifications" ON robot_specifications
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- Users can delete specifications they created, moderators can delete any
CREATE POLICY "Contributors can delete their robot specifications" ON robot_specifications
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- ============================================================================
-- ROBOT MEDIA TABLE POLICIES
-- ============================================================================

-- Public read access to media
CREATE POLICY "Public robot media are viewable by everyone" ON robot_media
    FOR SELECT USING (true);

-- Authenticated users can create media
CREATE POLICY "Authenticated users can create robot media" ON robot_media
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update media they created, moderators can update any
CREATE POLICY "Users can update their robot media" ON robot_media
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- Users can delete media they created, moderators can delete any
CREATE POLICY "Users can delete their robot media" ON robot_media
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- ============================================================================
-- ROBOT REVIEWS TABLE POLICIES
-- ============================================================================

-- Public read access to approved reviews
CREATE POLICY "Public robot reviews are viewable by everyone" ON robot_reviews
    FOR SELECT USING (is_approved = true);

-- Authenticated users can view all reviews
CREATE POLICY "Authenticated users can view all robot reviews" ON robot_reviews
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create robot reviews" ON robot_reviews
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- Users can update their own reviews
CREATE POLICY "Users can update their own robot reviews" ON robot_reviews
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- Users can delete their own reviews, moderators can delete any
CREATE POLICY "Users can delete their own robot reviews" ON robot_reviews
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        )
    );

-- ============================================================================
-- USER ROBOT INTERACTIONS TABLE POLICIES
-- ============================================================================

-- Users can only see their own interactions
CREATE POLICY "Users can view their own robot interactions" ON user_robot_interactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- Users can create their own interactions
CREATE POLICY "Users can create their own robot interactions" ON user_robot_interactions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- Users can update their own interactions
CREATE POLICY "Users can update their own robot interactions" ON user_robot_interactions
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- Users can delete their own interactions
CREATE POLICY "Users can delete their own robot interactions" ON user_robot_interactions
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- ============================================================================
-- ROBOT SEARCH ANALYTICS TABLE POLICIES
-- ============================================================================

-- Only admins can view search analytics
CREATE POLICY "Only admins can view robot search analytics" ON robot_search_analytics
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- System can create search analytics (no user restriction for anonymous searches)
CREATE POLICY "System can create robot search analytics" ON robot_search_analytics
    FOR INSERT WITH CHECK (true);

-- Only admins can update search analytics
CREATE POLICY "Only admins can update robot search analytics" ON robot_search_analytics
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can delete search analytics
CREATE POLICY "Only admins can delete robot search analytics" ON robot_search_analytics
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR POLICY CHECKS
-- ============================================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a robot
CREATE OR REPLACE FUNCTION user_owns_robot(robot_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM robots 
        WHERE id = robot_id 
        AND created_by = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ============================================================================

-- Function to log security violations (for monitoring)
CREATE OR REPLACE FUNCTION log_security_violation(
    table_name TEXT,
    operation TEXT,
    user_id UUID DEFAULT auth.uid(),
    details JSONB DEFAULT '{}'::JSONB
)
RETURNS void AS $$
BEGIN
    -- In a production environment, this could log to a security audit table
    -- For now, we'll use RAISE NOTICE for development
    RAISE NOTICE 'Security violation: User % attempted % on % - Details: %', 
                 COALESCE(user_id::TEXT, 'anonymous'), 
                 operation, 
                 table_name, 
                 details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLICY TESTING FUNCTIONS (Development Only)
-- ============================================================================

-- Function to test RLS policies (should only be used in development)
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
    table_name TEXT,
    policy_name TEXT,
    test_result TEXT
) AS $$
BEGIN
    -- This function can be used to validate that RLS policies are working correctly
    -- Implementation would include various test scenarios
    RETURN QUERY
    SELECT 
        'manufacturers'::TEXT as table_name,
        'Public access'::TEXT as policy_name,
        CASE 
            WHEN EXISTS(SELECT 1 FROM manufacturers WHERE is_active = true LIMIT 1) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END as test_result
    UNION ALL
    SELECT 
        'robots'::TEXT,
        'Public access'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM robots WHERE status IN ('active', 'discontinued') LIMIT 1) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION FOR RLS
-- ============================================================================

-- Create indexes to support RLS policy checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_robots_created_by ON robots(created_by);
CREATE INDEX IF NOT EXISTS idx_robot_specifications_created_by ON robot_specifications(created_by);
CREATE INDEX IF NOT EXISTS idx_robot_media_created_by ON robot_media(created_by);
CREATE INDEX IF NOT EXISTS idx_robot_reviews_user_approved ON robot_reviews(user_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_user_robot_interactions_user ON user_robot_interactions(user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION user_has_role IS 'Helper function to check if the current user has a specific role';
COMMENT ON FUNCTION user_has_any_role IS 'Helper function to check if the current user has any of the specified roles';
COMMENT ON FUNCTION user_owns_robot IS 'Helper function to check if the current user owns a specific robot';
COMMENT ON FUNCTION log_security_violation IS 'Function to log security policy violations for monitoring';
COMMENT ON FUNCTION test_rls_policies IS 'Development function to test RLS policies (remove in production)';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION user_has_role TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_any_role TO authenticated;
GRANT EXECUTE ON FUNCTION user_owns_robot TO authenticated;

-- Grant execute permissions on security functions to service role
GRANT EXECUTE ON FUNCTION log_security_violation TO service_role;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Verify that RLS is enabled on all tables
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'manufacturers', 'robot_categories', 'robots', 
            'robot_category_mappings', 'robot_specifications', 
            'robot_media', 'robot_reviews', 'user_robot_interactions', 
            'robot_search_analytics'
        )
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE n.nspname = tbl.schemaname 
            AND c.relname = tbl.tablename 
            AND c.relrowsecurity = true
        ) THEN
            RAISE EXCEPTION 'RLS is not enabled on table %.%', tbl.schemaname, tbl.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'RLS verification complete - all tables have RLS enabled';
END
$$;
