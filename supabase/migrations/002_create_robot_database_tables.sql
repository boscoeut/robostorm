-- Migration: Create Robot Database Tables
-- Description: Creates comprehensive tables for humanoid robots, their versions, and specifications
-- Dependencies: Requires 001_create_user_roles.sql to be applied first
-- Author: RoboStorm Development Team
-- Date: 2025-09-21

-- ============================================================================
-- MANUFACTURERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(500),
    country VARCHAR(100),
    founded_year INTEGER,
    description TEXT,
    logo_url VARCHAR(500),
    headquarters_address TEXT,
    contact_email VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for manufacturers
CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON manufacturers(name);
CREATE INDEX IF NOT EXISTS idx_manufacturers_slug ON manufacturers(slug);
CREATE INDEX IF NOT EXISTS idx_manufacturers_country ON manufacturers(country);
CREATE INDEX IF NOT EXISTS idx_manufacturers_active ON manufacturers(is_active);

-- ============================================================================
-- ROBOT CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS robot_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES robot_categories(id),
    sort_order INTEGER DEFAULT 0,
    icon_name VARCHAR(50), -- For UI icons
    color_hex VARCHAR(7), -- For UI theming
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for robot_categories
CREATE INDEX IF NOT EXISTS idx_robot_categories_slug ON robot_categories(slug);
CREATE INDEX IF NOT EXISTS idx_robot_categories_parent ON robot_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_robot_categories_active ON robot_categories(is_active);

-- ============================================================================
-- ROBOTS TABLE (Main Robot Information)
-- ============================================================================

CREATE TABLE IF NOT EXISTS robots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    model_number VARCHAR(100),
    
    -- Version tracking
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT true,
    parent_robot_id UUID REFERENCES robots(id), -- For linking versions
    
    -- Release information
    release_date DATE,
    announcement_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, discontinued, prototype, concept, development
    
    -- Physical Specifications
    height_cm DECIMAL(8,2),
    height_inches DECIMAL(8,2), -- Computed field for US users
    weight_kg DECIMAL(8,2),
    weight_lbs DECIMAL(8,2), -- Computed field for US users
    
    -- Power and Performance
    battery_type VARCHAR(100),
    battery_capacity_wh DECIMAL(10,2), -- Watt-hours
    battery_life_hours DECIMAL(6,2),
    charging_time_hours DECIMAL(6,2),
    power_consumption_watts DECIMAL(8,2),
    
    -- Movement and Capabilities
    walking_speed_kmh DECIMAL(6,2),
    walking_speed_mph DECIMAL(6,2), -- Computed field
    max_payload_kg DECIMAL(8,2),
    max_payload_lbs DECIMAL(8,2), -- Computed field
    degrees_of_freedom INTEGER,
    joint_count INTEGER,
    
    -- Environmental Specs
    operating_temperature_min INTEGER, -- Celsius
    operating_temperature_max INTEGER, -- Celsius
    ip_rating VARCHAR(10), -- Ingress Protection rating
    
    -- AI and Software
    ai_capabilities TEXT[],
    operating_system VARCHAR(100),
    programming_languages TEXT[],
    sdk_available BOOLEAN DEFAULT false,
    api_available BOOLEAN DEFAULT false,
    
    -- Sensors and Hardware
    sensors JSONB DEFAULT '{}', -- Flexible sensor data
    cameras_count INTEGER DEFAULT 0,
    microphones_count INTEGER DEFAULT 0,
    speakers_count INTEGER DEFAULT 0,
    
    -- Computing Specifications
    cpu_model VARCHAR(200),
    gpu_model VARCHAR(200),
    ram_gb INTEGER,
    storage_gb INTEGER,
    
    -- Connectivity
    wifi_standards TEXT[],
    bluetooth_version VARCHAR(20),
    ethernet_ports INTEGER DEFAULT 0,
    usb_ports INTEGER DEFAULT 0,
    other_connectivity JSONB DEFAULT '{}',
    
    -- Pricing and Availability
    estimated_price_usd DECIMAL(12,2),
    price_range_min_usd DECIMAL(12,2),
    price_range_max_usd DECIMAL(12,2),
    availability_status VARCHAR(50), -- available, limited, pre-order, discontinued, custom-only
    lead_time_weeks INTEGER,
    
    -- Content and Media
    description TEXT,
    features TEXT[],
    applications TEXT[],
    use_cases TEXT[],
    
    -- SEO and Display
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image_url VARCHAR(500),
    gallery_images JSONB DEFAULT '[]', -- Array of image URLs
    video_urls JSONB DEFAULT '[]', -- Array of video URLs
    
    -- Ratings and Engagement
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_prototype BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- External Links
    official_website VARCHAR(500),
    documentation_url VARCHAR(500),
    purchase_url VARCHAR(500),
    wikipedia_url VARCHAR(500),
    
    -- Timestamps and Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for robots table
CREATE INDEX IF NOT EXISTS idx_robots_slug ON robots(slug);
CREATE INDEX IF NOT EXISTS idx_robots_manufacturer ON robots(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_robots_status ON robots(status);
CREATE INDEX IF NOT EXISTS idx_robots_version ON robots(version);
CREATE INDEX IF NOT EXISTS idx_robots_latest_version ON robots(is_latest_version);
CREATE INDEX IF NOT EXISTS idx_robots_parent ON robots(parent_robot_id);
CREATE INDEX IF NOT EXISTS idx_robots_featured ON robots(is_featured);
CREATE INDEX IF NOT EXISTS idx_robots_verified ON robots(is_verified);
CREATE INDEX IF NOT EXISTS idx_robots_prototype ON robots(is_prototype);
CREATE INDEX IF NOT EXISTS idx_robots_release_date ON robots(release_date);
CREATE INDEX IF NOT EXISTS idx_robots_price ON robots(estimated_price_usd);
CREATE INDEX IF NOT EXISTS idx_robots_rating ON robots(rating_average);
CREATE INDEX IF NOT EXISTS idx_robots_height ON robots(height_cm);
CREATE INDEX IF NOT EXISTS idx_robots_weight ON robots(weight_kg);
CREATE INDEX IF NOT EXISTS idx_robots_dof ON robots(degrees_of_freedom);

-- ============================================================================
-- ROBOT_CATEGORY_MAPPINGS TABLE (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS robot_category_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES robot_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Mark primary category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(robot_id, category_id)
);

-- Indexes for robot_category_mappings
CREATE INDEX IF NOT EXISTS idx_robot_category_mappings_robot ON robot_category_mappings(robot_id);
CREATE INDEX IF NOT EXISTS idx_robot_category_mappings_category ON robot_category_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_robot_category_mappings_primary ON robot_category_mappings(is_primary);

-- ============================================================================
-- ROBOT_SPECIFICATIONS TABLE (Flexible Specs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS robot_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- mechanical, electrical, software, sensors, etc.
    name VARCHAR(255) NOT NULL,
    value VARCHAR(500) NOT NULL,
    unit VARCHAR(50),
    description TEXT,
    source_url VARCHAR(500), -- Source of the specification
    is_verified BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for robot_specifications
CREATE INDEX IF NOT EXISTS idx_robot_specifications_robot ON robot_specifications(robot_id);
CREATE INDEX IF NOT EXISTS idx_robot_specifications_category ON robot_specifications(category);
CREATE INDEX IF NOT EXISTS idx_robot_specifications_name ON robot_specifications(name);
CREATE INDEX IF NOT EXISTS idx_robot_specifications_verified ON robot_specifications(is_verified);

-- ============================================================================
-- ROBOT_MEDIA TABLE (Images, Videos, Documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS robot_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- image, video, document, 3d_model, datasheet
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    
    -- Image/Video specific
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER, -- for videos
    
    -- Metadata
    title VARCHAR(255),
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    tags TEXT[],
    
    -- Organization
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Rights and Attribution
    copyright_info TEXT,
    license_type VARCHAR(100),
    source_url VARCHAR(500),
    attribution TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Indexes for robot_media
CREATE INDEX IF NOT EXISTS idx_robot_media_robot ON robot_media(robot_id);
CREATE INDEX IF NOT EXISTS idx_robot_media_type ON robot_media(file_type);
CREATE INDEX IF NOT EXISTS idx_robot_media_primary ON robot_media(is_primary);
CREATE INDEX IF NOT EXISTS idx_robot_media_featured ON robot_media(is_featured);

-- ============================================================================
-- ROBOT_REVIEWS TABLE (User Reviews and Ratings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS robot_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    pros TEXT[],
    cons TEXT[],
    
    -- Review Context
    usage_context VARCHAR(100), -- research, industrial, personal, educational
    usage_duration VARCHAR(50), -- days, weeks, months, years
    experience_level VARCHAR(50), -- beginner, intermediate, expert
    
    -- Verification and Quality
    verified_purchase BOOLEAN DEFAULT false,
    verified_user BOOLEAN DEFAULT false,
    is_expert_review BOOLEAN DEFAULT false,
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per user per robot
    UNIQUE(robot_id, user_id)
);

-- Indexes for robot_reviews
CREATE INDEX IF NOT EXISTS idx_robot_reviews_robot ON robot_reviews(robot_id);
CREATE INDEX IF NOT EXISTS idx_robot_reviews_user ON robot_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_robot_reviews_rating ON robot_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_robot_reviews_verified ON robot_reviews(verified_purchase);
CREATE INDEX IF NOT EXISTS idx_robot_reviews_approved ON robot_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_robot_reviews_created ON robot_reviews(created_at);

-- ============================================================================
-- USER_ROBOT_INTERACTIONS TABLE (Favorites, Bookmarks, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_robot_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    
    -- Interaction Types
    is_favorite BOOLEAN DEFAULT false,
    is_bookmarked BOOLEAN DEFAULT false,
    is_watching BOOLEAN DEFAULT false, -- For updates
    is_owned BOOLEAN DEFAULT false,
    is_wishlist BOOLEAN DEFAULT false,
    
    -- Interaction Data
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT, -- User's personal notes about the robot
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, robot_id)
);

-- Indexes for user_robot_interactions
CREATE INDEX IF NOT EXISTS idx_user_robot_interactions_user ON user_robot_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_robot_interactions_robot ON user_robot_interactions(robot_id);
CREATE INDEX IF NOT EXISTS idx_user_robot_interactions_favorite ON user_robot_interactions(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_robot_interactions_bookmarked ON user_robot_interactions(is_bookmarked);
CREATE INDEX IF NOT EXISTS idx_user_robot_interactions_owned ON user_robot_interactions(is_owned);

-- ============================================================================
-- SEARCH_ANALYTICS TABLE (Track Search Queries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS robot_search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text VARCHAR(500) NOT NULL,
    result_count INTEGER DEFAULT 0,
    filters_applied JSONB DEFAULT '{}',
    sort_order VARCHAR(50),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    clicked_robot_id UUID REFERENCES robots(id),
    click_position INTEGER, -- Position in search results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for robot_search_analytics
CREATE INDEX IF NOT EXISTS idx_robot_search_analytics_query ON robot_search_analytics(query_text);
CREATE INDEX IF NOT EXISTS idx_robot_search_analytics_created ON robot_search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_robot_search_analytics_user ON robot_search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_robot_search_analytics_clicked_robot ON robot_search_analytics(clicked_robot_id);

-- ============================================================================
-- COMPUTED COLUMNS TRIGGERS
-- ============================================================================

-- Function to update computed fields (imperial units)
CREATE OR REPLACE FUNCTION update_robot_computed_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert height cm to inches
    IF NEW.height_cm IS NOT NULL THEN
        NEW.height_inches = NEW.height_cm * 0.393701;
    END IF;
    
    -- Convert weight kg to lbs
    IF NEW.weight_kg IS NOT NULL THEN
        NEW.weight_lbs = NEW.weight_kg * 2.20462;
    END IF;
    
    -- Convert speed km/h to mph
    IF NEW.walking_speed_kmh IS NOT NULL THEN
        NEW.walking_speed_mph = NEW.walking_speed_kmh * 0.621371;
    END IF;
    
    -- Convert payload kg to lbs
    IF NEW.max_payload_kg IS NOT NULL THEN
        NEW.max_payload_lbs = NEW.max_payload_kg * 2.20462;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to robots table
CREATE TRIGGER update_robot_computed_fields_trigger
    BEFORE INSERT OR UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_robot_computed_fields();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robot_categories_updated_at BEFORE UPDATE ON robot_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robots_updated_at BEFORE UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robot_specifications_updated_at BEFORE UPDATE ON robot_specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robot_media_updated_at BEFORE UPDATE ON robot_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robot_reviews_updated_at BEFORE UPDATE ON robot_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_robot_interactions_updated_at BEFORE UPDATE ON user_robot_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RATING CALCULATION TRIGGERS
-- ============================================================================

-- Function to update robot rating when reviews change
CREATE OR REPLACE FUNCTION update_robot_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_robot_id UUID;
BEGIN
    -- Get the robot_id from the trigger
    target_robot_id = COALESCE(NEW.robot_id, OLD.robot_id);
    
    -- Update robot rating statistics
    UPDATE robots 
    SET 
        rating_average = COALESCE((
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM robot_reviews 
            WHERE robot_id = target_robot_id 
            AND is_approved = true
        ), 0),
        rating_count = (
            SELECT COUNT(*) 
            FROM robot_reviews 
            WHERE robot_id = target_robot_id 
            AND is_approved = true
        ),
        updated_at = NOW()
    WHERE id = target_robot_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply rating update trigger
CREATE TRIGGER update_robot_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON robot_reviews
    FOR EACH ROW EXECUTE FUNCTION update_robot_rating();

-- ============================================================================
-- SLUG GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(
        regexp_replace(
            regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
    ));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERSION MANAGEMENT TRIGGERS
-- ============================================================================

-- Function to manage robot versions
CREATE OR REPLACE FUNCTION manage_robot_versions()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is marked as latest version, unmark others
    IF NEW.is_latest_version = true AND NEW.parent_robot_id IS NOT NULL THEN
        UPDATE robots 
        SET is_latest_version = false 
        WHERE parent_robot_id = NEW.parent_robot_id 
        AND id != NEW.id;
        
        -- Also update the parent
        UPDATE robots 
        SET is_latest_version = false 
        WHERE id = NEW.parent_robot_id;
    END IF;
    
    -- If this is a new robot with same name but different version
    IF NEW.parent_robot_id IS NULL AND NEW.is_latest_version = true THEN
        UPDATE robots 
        SET is_latest_version = false 
        WHERE manufacturer_id = NEW.manufacturer_id 
        AND name = NEW.name 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply version management trigger
CREATE TRIGGER manage_robot_versions_trigger
    BEFORE INSERT OR UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION manage_robot_versions();

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- Add helpful comments to tables
COMMENT ON TABLE manufacturers IS 'Companies and organizations that develop humanoid robots';
COMMENT ON TABLE robot_categories IS 'Hierarchical categories for organizing robots (e.g., Humanoid Assistants, Research Platforms)';
COMMENT ON TABLE robots IS 'Main table storing comprehensive information about humanoid robots and their versions';
COMMENT ON TABLE robot_category_mappings IS 'Many-to-many relationship between robots and categories';
COMMENT ON TABLE robot_specifications IS 'Flexible key-value specifications for robots';
COMMENT ON TABLE robot_media IS 'Images, videos, documents, and other media files for robots';
COMMENT ON TABLE robot_reviews IS 'User reviews and ratings for robots';
COMMENT ON TABLE user_robot_interactions IS 'User interactions with robots (favorites, bookmarks, etc.)';
COMMENT ON TABLE robot_search_analytics IS 'Analytics data for robot search queries and user behavior';

-- Add column comments for key fields
COMMENT ON COLUMN robots.parent_robot_id IS 'References the previous version of this robot for version tracking';
COMMENT ON COLUMN robots.is_latest_version IS 'Indicates if this is the latest version of the robot';
COMMENT ON COLUMN robots.version IS 'Version identifier (e.g., "1.0", "Gen 2", "Prototype")';
COMMENT ON COLUMN robots.sensors IS 'JSON object containing detailed sensor information';
COMMENT ON COLUMN robots.ai_capabilities IS 'Array of AI capabilities (e.g., ["computer_vision", "natural_language_processing"])';
