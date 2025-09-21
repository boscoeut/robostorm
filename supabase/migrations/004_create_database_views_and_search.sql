-- Migration: Create Database Views and Search Functions
-- Description: Creates optimized views and full-text search capabilities for the robot database
-- Dependencies: Requires 002_create_robot_database_tables.sql and 003_seed_initial_robot_data.sql
-- Author: RoboStorm Development Team
-- Date: 2025-09-21

-- ============================================================================
-- FIRST: ADD SEARCH COLUMN TO ROBOTS TABLE
-- ============================================================================

-- Add search text column to robots table before creating views
ALTER TABLE robots ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Function to update search text
CREATE OR REPLACE FUNCTION update_robot_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := 
        NEW.name || ' ' ||
        COALESCE(NEW.model_number, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.features, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.applications, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.ai_capabilities, ' '), '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain search text
CREATE TRIGGER update_robot_search_text_trigger
    BEFORE INSERT OR UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_robot_search_text();

-- Update search text for existing robots
UPDATE robots SET 
    search_text = 
        name || ' ' ||
        COALESCE(model_number, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(features, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(applications, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(ai_capabilities, ' '), '')
WHERE search_text IS NULL;

-- Create full-text search index on the search text column
CREATE INDEX IF NOT EXISTS idx_robots_search_fts ON robots 
USING gin(to_tsvector('english', search_text));

-- ============================================================================
-- ROBOT SUMMARY VIEW (Optimized for listings)
-- ============================================================================

CREATE OR REPLACE VIEW robot_summary AS
SELECT 
    r.id,
    r.name,
    r.slug,
    r.version,
    r.is_latest_version,
    r.parent_robot_id,
    r.release_date,
    r.status,
    
    -- Physical specs
    r.height_cm,
    r.height_inches,
    r.weight_kg,
    r.weight_lbs,
    r.degrees_of_freedom,
    
    -- Pricing and availability
    r.estimated_price_usd,
    r.availability_status,
    
    -- Media and display
    r.featured_image_url,
    r.description,
    r.features,
    r.applications,
    
    -- Ratings and engagement
    r.rating_average,
    r.rating_count,
    r.view_count,
    r.favorite_count,
    r.is_featured,
    r.is_verified,
    r.is_prototype,
    
    -- Manufacturer info
    m.id as manufacturer_id,
    m.name as manufacturer_name,
    m.slug as manufacturer_slug,
    m.country as manufacturer_country,
    m.logo_url as manufacturer_logo_url,
    
    -- Primary category
    pc.name as primary_category_name,
    pc.slug as primary_category_slug,
    pc.icon_name as primary_category_icon,
    pc.color_hex as primary_category_color,
    
    -- All categories (aggregated)
    STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) as all_categories,
    ARRAY_AGG(DISTINCT c.slug ORDER BY c.slug) as category_slugs,
    
    -- Timestamps
    r.created_at,
    r.updated_at
    
FROM robots r
LEFT JOIN manufacturers m ON r.manufacturer_id = m.id
LEFT JOIN robot_category_mappings rcm ON r.id = rcm.robot_id
LEFT JOIN robot_categories c ON rcm.category_id = c.id
LEFT JOIN robot_category_mappings prcm ON r.id = prcm.robot_id AND prcm.is_primary = true
LEFT JOIN robot_categories pc ON prcm.category_id = pc.id
GROUP BY 
    r.id, r.name, r.slug, r.version, r.is_latest_version, r.parent_robot_id,
    r.release_date, r.status, r.height_cm, r.height_inches, r.weight_kg, r.weight_lbs,
    r.degrees_of_freedom, r.estimated_price_usd, r.availability_status,
    r.featured_image_url, r.description, r.features, r.applications,
    r.rating_average, r.rating_count, r.view_count, r.favorite_count,
    r.is_featured, r.is_verified, r.is_prototype, r.created_at, r.updated_at,
    m.id, m.name, m.slug, m.country, m.logo_url,
    pc.name, pc.slug, pc.icon_name, pc.color_hex;

-- ============================================================================
-- ROBOT DETAIL VIEW (Full information for detail pages)
-- ============================================================================

CREATE OR REPLACE VIEW robot_detail AS
SELECT 
    r.*,
    
    -- Manufacturer details
    m.name as manufacturer_name,
    m.slug as manufacturer_slug,
    m.website as manufacturer_website,
    m.country as manufacturer_country,
    m.founded_year as manufacturer_founded_year,
    m.description as manufacturer_description,
    m.logo_url as manufacturer_logo_url,
    
    -- Category information
    (
        SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'slug', c.slug,
                'description', c.description,
                'icon_name', c.icon_name,
                'color_hex', c.color_hex,
                'is_primary', rcm.is_primary
            ) ORDER BY rcm.is_primary DESC, c.name
        )
        FROM robot_category_mappings rcm
        JOIN robot_categories c ON rcm.category_id = c.id
        WHERE rcm.robot_id = r.id
    ) as categories,
    
    -- Specifications grouped by category
    (
        SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'category', spec_category,
                'specifications', specifications
            ) ORDER BY spec_category
        )
        FROM (
            SELECT 
                rs.category as spec_category,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', rs.id,
                        'name', rs.name,
                        'value', rs.value,
                        'unit', rs.unit,
                        'description', rs.description,
                        'is_verified', rs.is_verified
                    ) ORDER BY rs.sort_order, rs.name
                ) as specifications
            FROM robot_specifications rs
            WHERE rs.robot_id = r.id
            GROUP BY rs.category
        ) grouped_specs
    ) as specifications_by_category,
    
    -- Media files
    (
        SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', rm.id,
                'file_type', rm.file_type,
                'file_name', rm.file_name,
                'file_url', rm.file_url,
                'thumbnail_url', rm.thumbnail_url,
                'title', rm.title,
                'alt_text', rm.alt_text,
                'caption', rm.caption,
                'is_primary', rm.is_primary,
                'is_featured', rm.is_featured
            ) ORDER BY rm.is_primary DESC, rm.is_featured DESC, rm.sort_order, rm.created_at
        )
        FROM robot_media rm
        WHERE rm.robot_id = r.id
    ) as media_files,
    
    -- Recent reviews summary
    (
        SELECT JSON_BUILD_OBJECT(
            'average_rating', ROUND(AVG(rr.rating)::NUMERIC, 2),
            'total_reviews', COUNT(*),
            'rating_distribution', JSON_BUILD_OBJECT(
                '5_star', COUNT(*) FILTER (WHERE rr.rating = 5),
                '4_star', COUNT(*) FILTER (WHERE rr.rating = 4),
                '3_star', COUNT(*) FILTER (WHERE rr.rating = 3),
                '2_star', COUNT(*) FILTER (WHERE rr.rating = 2),
                '1_star', COUNT(*) FILTER (WHERE rr.rating = 1)
            ),
            'recent_reviews', (
                SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', rr2.id,
                        'rating', rr2.rating,
                        'title', rr2.title,
                        'content', LEFT(rr2.content, 200),
                        'created_at', rr2.created_at,
                        'verified_purchase', rr2.verified_purchase,
                        'helpful_count', rr2.helpful_count
                    ) ORDER BY rr2.created_at DESC
                )
                FROM robot_reviews rr2
                WHERE rr2.robot_id = r.id AND rr2.is_approved = true
                LIMIT 5
            )
        )
        FROM robot_reviews rr
        WHERE rr.robot_id = r.id AND rr.is_approved = true
    ) as reviews_summary,
    
    -- Version history (if this robot has versions)
    (
        SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', rv.id,
                'name', rv.name,
                'slug', rv.slug,
                'version', rv.version,
                'release_date', rv.release_date,
                'status', rv.status,
                'is_latest_version', rv.is_latest_version,
                'featured_image_url', rv.featured_image_url
            ) ORDER BY rv.release_date DESC
        )
        FROM robots rv
        WHERE (rv.parent_robot_id = r.id OR rv.id = r.parent_robot_id OR 
               (r.parent_robot_id IS NOT NULL AND rv.parent_robot_id = r.parent_robot_id))
        AND rv.id != r.id
    ) as version_history
    
FROM robots r
LEFT JOIN manufacturers m ON r.manufacturer_id = m.id;

-- ============================================================================
-- ROBOT SEARCH INDEX VIEW (Optimized for search)
-- ============================================================================

CREATE OR REPLACE VIEW robot_search_index AS
SELECT 
    r.id,
    r.name,
    r.slug,
    r.version,
    r.description,
    r.model_number,
    r.status,
    r.is_latest_version,
    r.is_featured,
    r.is_verified,
    r.height_cm,
    r.weight_kg,
    r.estimated_price_usd,
    r.rating_average,
    r.rating_count,
    r.release_date,
    r.created_at,
    
    -- Manufacturer info for search
    m.name as manufacturer_name,
    m.country as manufacturer_country,
    
    -- Searchable text fields
    ARRAY_TO_STRING(r.features, ' ') as features_text,
    ARRAY_TO_STRING(r.applications, ' ') as applications_text,
    ARRAY_TO_STRING(r.use_cases, ' ') as use_cases_text,
    ARRAY_TO_STRING(r.ai_capabilities, ' ') as ai_capabilities_text,
    
    -- Category names for search
    STRING_AGG(DISTINCT c.name, ' ') as category_names,
    ARRAY_AGG(DISTINCT c.slug) as category_slugs,
    
    -- Specifications text for search
    STRING_AGG(DISTINCT rs.name || ' ' || rs.value || ' ' || COALESCE(rs.unit, ''), ' ') as specifications_text
    
FROM robots r
LEFT JOIN manufacturers m ON r.manufacturer_id = m.id
LEFT JOIN robot_category_mappings rcm ON r.id = rcm.robot_id
LEFT JOIN robot_categories c ON rcm.category_id = c.id
LEFT JOIN robot_specifications rs ON r.id = rs.robot_id
GROUP BY 
    r.id, r.name, r.slug, r.version, r.description, r.model_number, r.status,
    r.is_latest_version, r.is_featured, r.is_verified, r.height_cm, r.weight_kg,
    r.estimated_price_usd, r.rating_average, r.rating_count, r.release_date, r.created_at,
    m.name, m.country, r.features, r.applications, r.use_cases, r.ai_capabilities;

-- ============================================================================
-- FULL-TEXT SEARCH CONFIGURATION
-- ============================================================================

-- Create a simplified search function instead of computed column
-- This avoids the complexity of including related data in a computed column
CREATE OR REPLACE FUNCTION get_robot_search_text(robot_id UUID)
RETURNS TEXT AS $$
DECLARE
    search_text TEXT;
BEGIN
    SELECT 
        r.name || ' ' ||
        COALESCE(r.model_number, '') || ' ' ||
        COALESCE(r.description, '') || ' ' ||
        COALESCE(m.name, '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(r.features, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(r.applications, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(r.ai_capabilities, ' '), '') || ' ' ||
        COALESCE(STRING_AGG(DISTINCT c.name, ' '), '') || ' ' ||
        COALESCE(STRING_AGG(DISTINCT rs.name || ' ' || rs.value, ' '), '')
    INTO search_text
    FROM robots r
    LEFT JOIN manufacturers m ON r.manufacturer_id = m.id
    LEFT JOIN robot_category_mappings rcm ON r.id = rcm.robot_id
    LEFT JOIN robot_categories c ON rcm.category_id = c.id
    LEFT JOIN robot_specifications rs ON r.id = rs.robot_id
    WHERE r.id = robot_id
    GROUP BY r.id, r.name, r.model_number, r.description, r.features, r.applications, r.ai_capabilities, m.name;
    
    RETURN COALESCE(search_text, '');
END;
$$ LANGUAGE plpgsql;

-- Search column already created at the top of the migration
-- ALTER TABLE robots ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Function already created at the top of the migration
-- Function to update search text
-- CREATE OR REPLACE FUNCTION update_robot_search_text()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.search_text := 
--         NEW.name || ' ' ||
--         COALESCE(NEW.model_number, '') || ' ' ||
--         COALESCE(NEW.description, '') || ' ' ||
--         COALESCE(ARRAY_TO_STRING(NEW.features, ' '), '') || ' ' ||
--         COALESCE(ARRAY_TO_STRING(NEW.applications, ' '), '') || ' ' ||
--         COALESCE(ARRAY_TO_STRING(NEW.ai_capabilities, ' '), '');
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Trigger already created at the top of the migration
-- Create trigger to maintain search text
-- CREATE TRIGGER update_robot_search_text_trigger
--     BEFORE INSERT OR UPDATE ON robots
--     FOR EACH ROW EXECUTE FUNCTION update_robot_search_text();

-- Create full-text search index on the search text column
-- CREATE INDEX IF NOT EXISTS idx_robots_search_fts ON robots 
-- USING gin(to_tsvector('english', search_text));

-- Update search text for existing robots
-- UPDATE robots SET 
--     search_text = 
--         name || ' ' ||
--         COALESCE(model_number, '') || ' ' ||
--         COALESCE(description, '') || ' ' ||
--         COALESCE(ARRAY_TO_STRING(features, ' '), '') || ' ' ||
--         COALESCE(ARRAY_TO_STRING(applications, ' '), '') || ' ' ||
--         COALESCE(ARRAY_TO_STRING(ai_capabilities, ' '), '')
-- WHERE search_text IS NULL;

-- Additional search indexes are already created in the main robots table migration
-- These indexes support the search functionality:
-- - idx_robots_name (already exists)
-- - idx_robots_manufacturer (already exists) 
-- - idx_robots_latest_version (already exists)
-- - idx_robots_featured (already exists)
-- - idx_robots_verified (already exists)
-- - idx_robots_price (already exists)
-- - idx_robots_rating (already exists)
-- - idx_robots_height (already exists)
-- - idx_robots_weight (already exists)
-- - idx_robots_release_date (already exists)

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Main search function with filtering and sorting
CREATE OR REPLACE FUNCTION search_robots(
    search_query TEXT DEFAULT '',
    filter_manufacturer_ids UUID[] DEFAULT NULL,
    filter_category_slugs TEXT[] DEFAULT NULL,
    filter_min_price DECIMAL DEFAULT NULL,
    filter_max_price DECIMAL DEFAULT NULL,
    filter_min_height DECIMAL DEFAULT NULL,
    filter_max_height DECIMAL DEFAULT NULL,
    filter_min_weight DECIMAL DEFAULT NULL,
    filter_max_weight DECIMAL DEFAULT NULL,
    filter_status TEXT[] DEFAULT NULL,
    filter_latest_only BOOLEAN DEFAULT false,
    filter_featured_only BOOLEAN DEFAULT false,
    filter_verified_only BOOLEAN DEFAULT false,
    sort_by TEXT DEFAULT 'relevance',
    sort_direction TEXT DEFAULT 'desc',
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    version VARCHAR,
    manufacturer_name VARCHAR,
    manufacturer_country VARCHAR,
    category_names TEXT,
    category_slugs TEXT[],
    description TEXT,
    height_cm DECIMAL,
    weight_kg DECIMAL,
    estimated_price_usd DECIMAL,
    rating_average DECIMAL,
    rating_count INTEGER,
    is_featured BOOLEAN,
    is_verified BOOLEAN,
    release_date DATE,
    search_rank REAL
) AS $$
DECLARE
    base_query TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    order_clause TEXT;
    final_query TEXT;
BEGIN
    -- Base query
    base_query := 'SELECT 
        rsi.id, rsi.name, rsi.slug, rsi.version, rsi.manufacturer_name, rsi.manufacturer_country,
        rsi.category_names, rsi.category_slugs, rsi.description, rsi.height_cm, rsi.weight_kg,
        rsi.estimated_price_usd, rsi.rating_average, rsi.rating_count, rsi.is_featured, rsi.is_verified,
        rsi.release_date';
    
    -- Add search rank if there's a search query
    IF search_query != '' AND search_query IS NOT NULL THEN
        base_query := base_query || ', ts_rank(to_tsvector(''english'', r.search_text), plainto_tsquery(''english'', $1)) as search_rank';
        where_conditions := where_conditions || ARRAY['to_tsvector(''english'', r.search_text) @@ plainto_tsquery(''english'', $1)'];
    ELSE
        base_query := base_query || ', 0.0 as search_rank';
    END IF;
    
    base_query := base_query || ' FROM robot_search_index rsi JOIN robots r ON rsi.id = r.id';
    
    -- Add manufacturer filter
    IF filter_manufacturer_ids IS NOT NULL AND array_length(filter_manufacturer_ids, 1) > 0 THEN
        where_conditions := where_conditions || ARRAY['EXISTS (SELECT 1 FROM manufacturers m WHERE r.manufacturer_id = m.id AND m.id = ANY($' || (array_length(where_conditions, 1) + 2)::TEXT || '))'];
    END IF;
    
    -- Add category filter
    IF filter_category_slugs IS NOT NULL AND array_length(filter_category_slugs, 1) > 0 THEN
        where_conditions := where_conditions || ARRAY['rsi.category_slugs && $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    -- Add price filters
    IF filter_min_price IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['rsi.estimated_price_usd >= $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    IF filter_max_price IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['rsi.estimated_price_usd <= $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    -- Add dimension filters
    IF filter_min_height IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['rsi.height_cm >= $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    IF filter_max_height IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['rsi.height_cm <= $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    IF filter_min_weight IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['rsi.weight_kg >= $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    IF filter_max_weight IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['rsi.weight_kg <= $' || (array_length(where_conditions, 1) + 2)::TEXT];
    END IF;
    
    -- Add status filter
    IF filter_status IS NOT NULL AND array_length(filter_status, 1) > 0 THEN
        where_conditions := where_conditions || ARRAY['rsi.status = ANY($' || (array_length(where_conditions, 1) + 2)::TEXT || ')'];
    END IF;
    
    -- Add boolean filters
    IF filter_latest_only THEN
        where_conditions := where_conditions || ARRAY['rsi.is_latest_version = true'];
    END IF;
    
    IF filter_featured_only THEN
        where_conditions := where_conditions || ARRAY['rsi.is_featured = true'];
    END IF;
    
    IF filter_verified_only THEN
        where_conditions := where_conditions || ARRAY['rsi.is_verified = true'];
    END IF;
    
    -- Build WHERE clause
    IF array_length(where_conditions, 1) > 0 THEN
        base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    
    -- Build ORDER BY clause
    CASE sort_by
        WHEN 'relevance' THEN
            IF search_query != '' AND search_query IS NOT NULL THEN
                order_clause := 'ORDER BY search_rank ' || sort_direction;
            ELSE
                order_clause := 'ORDER BY rsi.is_featured DESC, rsi.rating_average DESC, rsi.created_at DESC';
            END IF;
        WHEN 'name' THEN
            order_clause := 'ORDER BY rsi.name ' || sort_direction;
        WHEN 'price' THEN
            order_clause := 'ORDER BY rsi.estimated_price_usd ' || sort_direction || ' NULLS LAST';
        WHEN 'rating' THEN
            order_clause := 'ORDER BY rsi.rating_average ' || sort_direction || ', rsi.rating_count ' || sort_direction;
        WHEN 'release_date' THEN
            order_clause := 'ORDER BY rsi.release_date ' || sort_direction || ' NULLS LAST';
        WHEN 'height' THEN
            order_clause := 'ORDER BY rsi.height_cm ' || sort_direction || ' NULLS LAST';
        WHEN 'weight' THEN
            order_clause := 'ORDER BY rsi.weight_kg ' || sort_direction || ' NULLS LAST';
        ELSE
            order_clause := 'ORDER BY rsi.is_featured DESC, rsi.rating_average DESC, rsi.created_at DESC';
    END CASE;
    
    -- Add pagination
    final_query := base_query || ' ' || order_clause || ' LIMIT $' || (array_length(where_conditions, 1) + 2)::TEXT || ' OFFSET $' || (array_length(where_conditions, 1) + 3)::TEXT;
    
    -- Execute the dynamic query
    RETURN QUERY EXECUTE final_query 
    USING search_query, filter_manufacturer_ids, filter_category_slugs, filter_min_price, filter_max_price,
          filter_min_height, filter_max_height, filter_min_weight, filter_max_weight, filter_status,
          page_limit, page_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POPULAR ROBOTS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_popular_robots(
    limit_count INTEGER DEFAULT 10,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    manufacturer_name VARCHAR,
    featured_image_url VARCHAR,
    rating_average DECIMAL,
    rating_count INTEGER,
    view_count INTEGER,
    favorite_count INTEGER,
    popularity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.name,
        rs.slug,
        rs.manufacturer_name,
        r.featured_image_url,
        rs.rating_average,
        rs.rating_count,
        rs.view_count,
        rs.favorite_count,
        -- Popularity score calculation
        (
            COALESCE(rs.rating_average, 0) * 0.3 +
            (COALESCE(rs.view_count, 0)::DECIMAL / 1000) * 0.4 +
            (COALESCE(rs.favorite_count, 0)::DECIMAL / 100) * 0.2 +
            (CASE WHEN rs.is_featured THEN 2.0 ELSE 0.0 END) * 0.1
        ) as popularity_score
    FROM robot_summary rs
    JOIN robots r ON rs.id = r.id
    WHERE rs.is_latest_version = true
    ORDER BY popularity_score DESC, rs.rating_average DESC, rs.view_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FEATURED ROBOTS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_featured_robots(
    limit_count INTEGER DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    version VARCHAR,
    manufacturer_name VARCHAR,
    primary_category_name VARCHAR,
    description TEXT,
    featured_image_url VARCHAR,
    rating_average DECIMAL,
    rating_count INTEGER,
    estimated_price_usd DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.name,
        rs.slug,
        rs.version,
        rs.manufacturer_name,
        rs.primary_category_name,
        rs.description,
        rs.featured_image_url,
        rs.rating_average,
        rs.rating_count,
        rs.estimated_price_usd
    FROM robot_summary rs
    WHERE rs.is_featured = true 
    AND rs.is_latest_version = true
    ORDER BY rs.rating_average DESC, rs.view_count DESC, rs.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CATEGORY STATISTICS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_category_statistics()
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    category_slug VARCHAR,
    category_icon VARCHAR,
    category_color VARCHAR,
    robot_count BIGINT,
    avg_rating DECIMAL,
    avg_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.icon_name,
        c.color_hex,
        COUNT(DISTINCT r.id) as robot_count,
        ROUND(AVG(r.rating_average), 2) as avg_rating,
        ROUND(AVG(r.estimated_price_usd), 2) as avg_price
    FROM robot_categories c
    LEFT JOIN robot_category_mappings rcm ON c.id = rcm.category_id
    LEFT JOIN robots r ON rcm.robot_id = r.id AND r.is_latest_version = true
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.slug, c.icon_name, c.color_hex, c.sort_order
    ORDER BY c.sort_order, robot_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS (If needed in future)
-- ============================================================================

-- Function to refresh search statistics (can be called periodically)
CREATE OR REPLACE FUNCTION refresh_search_statistics()
RETURNS void AS $$
BEGIN
    -- Update view counts, ratings, etc. (placeholder for future use)
    -- This could be expanded to update materialized views if performance requires it
    ANALYZE robot_search_index;
    ANALYZE robot_summary;
    ANALYZE robot_detail;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR VIEWS AND FUNCTIONS
-- ============================================================================

COMMENT ON VIEW robot_summary IS 'Optimized view for robot listings with manufacturer and category information';
COMMENT ON VIEW robot_detail IS 'Comprehensive view for robot detail pages with all related data';
COMMENT ON VIEW robot_search_index IS 'Optimized view for full-text search with aggregated searchable content';

COMMENT ON FUNCTION search_robots IS 'Advanced search function with filtering, sorting, and pagination';
COMMENT ON FUNCTION get_popular_robots IS 'Returns most popular robots based on ratings, views, and favorites';
COMMENT ON FUNCTION get_featured_robots IS 'Returns featured robots for homepage and promotional displays';
COMMENT ON FUNCTION get_category_statistics IS 'Returns statistics for each robot category';
COMMENT ON FUNCTION refresh_search_statistics IS 'Refreshes search-related statistics and indexes';

-- ============================================================================
-- INITIAL STATISTICS UPDATE
-- ============================================================================

-- Analyze the new views for optimal query planning
ANALYZE robot_summary;
ANALYZE robot_detail;
ANALYZE robot_search_index;
