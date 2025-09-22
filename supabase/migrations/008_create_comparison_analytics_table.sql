-- Migration: Create comparison analytics table
-- Description: Track robot comparison interactions for analytics and recommendations
-- Date: 2025-01-27

-- Create comparison_analytics table
CREATE TABLE IF NOT EXISTS comparison_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_1_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    robot_2_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    comparison_type VARCHAR(50) DEFAULT 'home_page', -- home_page, full_comparison, random
    interaction_type VARCHAR(50) NOT NULL, -- view, select, switch, click_compare_more
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comparison_analytics_robots 
    ON comparison_analytics (robot_1_id, robot_2_id);

CREATE INDEX IF NOT EXISTS idx_comparison_analytics_user 
    ON comparison_analytics (user_id);

CREATE INDEX IF NOT EXISTS idx_comparison_analytics_type 
    ON comparison_analytics (comparison_type);

CREATE INDEX IF NOT EXISTS idx_comparison_analytics_created 
    ON comparison_analytics (created_at);

CREATE INDEX IF NOT EXISTS idx_comparison_analytics_session 
    ON comparison_analytics (session_id);

-- Enable Row Level Security
ALTER TABLE comparison_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public read access for analytics (for admin/moderator use)
CREATE POLICY "Public read access for comparison analytics" ON comparison_analytics
    FOR SELECT USING (true);

-- Authenticated users can insert their own analytics
CREATE POLICY "Users can insert their own comparison analytics" ON comparison_analytics
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        (user_id IS NULL OR user_id = auth.uid())
    );

-- Only admins and moderators can update/delete analytics
CREATE POLICY "Admins and moderators can manage comparison analytics" ON comparison_analytics
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Create function to track comparison interactions
CREATE OR REPLACE FUNCTION track_comparison_interaction(
    p_robot_1_id UUID,
    p_robot_2_id UUID,
    p_interaction_type VARCHAR(50),
    p_comparison_type VARCHAR(50) DEFAULT 'home_page',
    p_session_id VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_analytics_id UUID;
BEGIN
    INSERT INTO comparison_analytics (
        robot_1_id,
        robot_2_id,
        user_id,
        session_id,
        comparison_type,
        interaction_type
    ) VALUES (
        p_robot_1_id,
        p_robot_2_id,
        auth.uid(),
        p_session_id,
        p_comparison_type,
        p_interaction_type
    ) RETURNING id INTO v_analytics_id;
    
    RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get popular robot comparisons
CREATE OR REPLACE FUNCTION get_popular_robot_comparisons(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    robot_1_id UUID,
    robot_2_id UUID,
    robot_1_name VARCHAR,
    robot_2_name VARCHAR,
    comparison_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.robot_1_id,
        ca.robot_2_id,
        r1.name as robot_1_name,
        r2.name as robot_2_name,
        COUNT(*) as comparison_count
    FROM comparison_analytics ca
    JOIN robots r1 ON ca.robot_1_id = r1.id
    JOIN robots r2 ON ca.robot_2_id = r2.id
    WHERE ca.interaction_type = 'view'
    GROUP BY ca.robot_1_id, ca.robot_2_id, r1.name, r2.name
    ORDER BY comparison_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get robot comparison statistics
CREATE OR REPLACE FUNCTION get_robot_comparison_stats(
    p_robot_id UUID
)
RETURNS TABLE (
    total_comparisons BIGINT,
    times_compared_as_1 BIGINT,
    times_compared_as_2 BIGINT,
    most_compared_with UUID,
    most_compared_with_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_comparisons,
        COUNT(CASE WHEN ca.robot_1_id = p_robot_id THEN 1 END) as times_compared_as_1,
        COUNT(CASE WHEN ca.robot_2_id = p_robot_id THEN 1 END) as times_compared_as_2,
        CASE 
            WHEN COUNT(CASE WHEN ca.robot_1_id = p_robot_id THEN ca.robot_2_id END) > 
                 COUNT(CASE WHEN ca.robot_2_id = p_robot_id THEN ca.robot_1_id END)
            THEN MODE() WITHIN GROUP (ORDER BY CASE WHEN ca.robot_1_id = p_robot_id THEN ca.robot_2_id ELSE ca.robot_1_id END)
            ELSE MODE() WITHIN GROUP (ORDER BY CASE WHEN ca.robot_2_id = p_robot_id THEN ca.robot_1_id ELSE ca.robot_2_id END)
        END as most_compared_with,
        CASE 
            WHEN COUNT(CASE WHEN ca.robot_1_id = p_robot_id THEN ca.robot_2_id END) > 
                 COUNT(CASE WHEN ca.robot_2_id = p_robot_id THEN ca.robot_1_id END)
            THEN (SELECT r.name FROM robots r WHERE r.id = MODE() WITHIN GROUP (ORDER BY CASE WHEN ca.robot_1_id = p_robot_id THEN ca.robot_2_id ELSE ca.robot_1_id END))
            ELSE (SELECT r.name FROM robots r WHERE r.id = MODE() WITHIN GROUP (ORDER BY CASE WHEN ca.robot_2_id = p_robot_id THEN ca.robot_1_id ELSE ca.robot_2_id END))
        END as most_compared_with_name
    FROM comparison_analytics ca
    WHERE ca.robot_1_id = p_robot_id OR ca.robot_2_id = p_robot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE comparison_analytics IS 'Tracks user interactions with robot comparisons for analytics and recommendations';
COMMENT ON COLUMN comparison_analytics.robot_1_id IS 'First robot in the comparison';
COMMENT ON COLUMN comparison_analytics.robot_2_id IS 'Second robot in the comparison';
COMMENT ON COLUMN comparison_analytics.user_id IS 'User who performed the interaction (null for anonymous)';
COMMENT ON COLUMN comparison_analytics.session_id IS 'Session identifier for anonymous users';
COMMENT ON COLUMN comparison_analytics.comparison_type IS 'Type of comparison: home_page, full_comparison, random';
COMMENT ON COLUMN comparison_analytics.interaction_type IS 'Type of interaction: view, select, switch, click_compare_more';
COMMENT ON FUNCTION track_comparison_interaction IS 'Tracks a comparison interaction for analytics';
COMMENT ON FUNCTION get_popular_robot_comparisons IS 'Returns the most popular robot comparisons';
COMMENT ON FUNCTION get_robot_comparison_stats IS 'Returns comparison statistics for a specific robot';
