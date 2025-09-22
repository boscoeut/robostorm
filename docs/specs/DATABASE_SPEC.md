# Database Specification
## RoboStorm - Humanoid Robot Database

### 1. Database Overview

The RoboStorm database is designed using PostgreSQL (via Supabase) to store comprehensive information about humanoid robots, their specifications, manufacturers, and user-generated content. The database follows normalized design principles while optimizing for read-heavy operations and complex search queries.

### 2. Database Architecture

#### 2.1 Core Design Principles
- **Normalization**: Third normal form (3NF) to reduce data redundancy
- **Performance**: Optimized indexes for search and filtering operations
- **Scalability**: Designed to handle millions of robot records
- **Security**: Row Level Security (RLS) for data access control
- **Flexibility**: Extensible schema for future robot attributes

#### 2.2 Database Schema Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   manufacturers │    │     robots      │    │   categories    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1:N                  │ N:M                   │ N:M
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   specifications│    │robot_categories │    │     reviews     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │ N:M
                                ▼
                       ┌─────────────────┐
                       │     media       │
                       │                 │
                       └─────────────────┘
```

### 3. Core Tables

#### 3.1 manufacturers
Stores information about robot manufacturers and companies.

```sql
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_manufacturers_name` on `name`
- `idx_manufacturers_country` on `country`
- `idx_manufacturers_active` on `is_active`

#### 3.2 categories
Defines different categories and types of humanoid robots.

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_categories_slug` on `slug`
- `idx_categories_parent` on `parent_id`
- `idx_categories_active` on `is_active`

#### 3.3 robots
Main table storing humanoid robot information.

```sql
CREATE TABLE robots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    model_number VARCHAR(100),
    release_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, discontinued, prototype, concept
    
    -- Physical Specifications
    height_cm DECIMAL(8,2),
    weight_kg DECIMAL(8,2),
    battery_life_hours DECIMAL(6,2),
    
    -- Capabilities
    walking_speed_kmh DECIMAL(6,2),
    max_payload_kg DECIMAL(8,2),
    operating_temperature_min INTEGER,
    operating_temperature_max INTEGER,
    
    -- AI and Software
    ai_capabilities TEXT[],
    operating_system VARCHAR(100),
    programming_languages TEXT[],
    
    -- Pricing and Availability
    estimated_price_usd DECIMAL(12,2),
    availability_status VARCHAR(50), -- available, limited, pre-order, discontinued
    
    -- Content
    description TEXT,
    features TEXT[],
    applications TEXT[],
    
    -- SEO and Display
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image_url VARCHAR(500),
    
    -- Status and Tracking
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

**Indexes:**
- `idx_robots_slug` on `slug`
- `idx_robots_manufacturer` on `manufacturer_id`
- `idx_robots_status` on `status`
- `idx_robots_featured` on `is_featured`
- `idx_robots_verified` on `is_verified`
- `idx_robots_release_date` on `release_date`
- `idx_robots_price` on `estimated_price_usd`
- `idx_robots_rating` on `rating_average`
- `idx_robots_height` on `height_cm`
- `idx_robots_weight` on `weight_kg`

#### 3.4 robot_categories
Many-to-many relationship between robots and categories.

```sql
CREATE TABLE robot_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(robot_id, category_id)
);
```

**Indexes:**
- `idx_robot_categories_robot` on `robot_id`
- `idx_robot_categories_category` on `category_id`

#### 3.5 specifications
Detailed technical specifications for robots.

```sql
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- mechanical, electrical, software, etc.
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_specifications_robot` on `robot_id`
- `idx_specifications_category` on `category`
- `idx_specifications_name` on `name`

#### 3.6 robot_media
Stores images, videos, and documents related to robots with comprehensive metadata and admin-only upload controls.

```sql
CREATE TABLE robot_media (
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
```

**Indexes:**
- `idx_robot_media_robot` on `robot_id`
- `idx_robot_media_type` on `file_type`
- `idx_robot_media_primary` on `is_primary`
- `idx_robot_media_featured` on `is_featured`

**Storage Integration:**
- Files stored in Supabase Storage `robot-media` bucket
- Organized folder structure: `robots/{robot_id}/media/`
- Admin-only upload policies with public read access
- Automatic thumbnail generation and image optimization

#### 3.7 reviews
User-generated reviews and ratings for robots.

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    pros TEXT[],
    cons TEXT[],
    usage_period VARCHAR(50), -- days, weeks, months, years
    verified_purchase BOOLEAN DEFAULT false,
    is_helpful_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_reviews_robot` on `robot_id`
- `idx_reviews_user` on `user_id`
- `idx_reviews_rating` on `rating`
- `idx_reviews_verified` on `is_verified`

#### 3.8 user_favorites
User's favorite robots collection.

```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, robot_id)
);
```

**Indexes:**
- `idx_user_favorites_user` on `user_id`
- `idx_user_favorites_robot` on `robot_id`

### 4. Search and Filtering Tables

#### 4.1 search_queries
Track popular search queries for analytics.

```sql
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text VARCHAR(500) NOT NULL,
    result_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_search_queries_text` on `query_text`
- `idx_search_queries_created` on `created_at`

### 5. Database Functions and Triggers

#### 5.1 Update Timestamps Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_robots_updated_at BEFORE UPDATE ON robots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 5.2 Robot Rating Calculation
```sql
CREATE OR REPLACE FUNCTION update_robot_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE robots 
    SET 
        rating_average = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM reviews 
            WHERE robot_id = COALESCE(NEW.robot_id, OLD.robot_id)
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE robot_id = COALESCE(NEW.robot_id, OLD.robot_id)
        )
    WHERE id = COALESCE(NEW.robot_id, OLD.robot_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_robot_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_robot_rating();
```

#### 5.3 Slug Generation
```sql
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
$$ language 'plpgsql';
```

### 6. Row Level Security (RLS) Policies

#### 6.1 Robots Table Policies
```sql
-- Enable RLS
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public robots are viewable by everyone" ON robots
    FOR SELECT USING (true);

-- Authenticated users can create robots (for admins/moderators)
CREATE POLICY "Authenticated users can create robots" ON robots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only admins and moderators can update
CREATE POLICY "Admins and moderators can update robots" ON robots
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );
```

#### 6.2 Reviews Table Policies
```sql
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

-- Users can create their own reviews
CREATE POLICY "Users can create their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);
```

### 7. Database Views

#### 7.1 Robot Summary View
```sql
CREATE VIEW robot_summary AS
SELECT 
    r.id,
    r.name,
    r.slug,
    r.featured_image_url,
    r.rating_average,
    r.rating_count,
    r.estimated_price_usd,
    r.height_cm,
    r.weight_kg,
    r.release_date,
    r.is_featured,
    r.is_verified,
    m.name as manufacturer_name,
    m.country as manufacturer_country,
    STRING_AGG(c.name, ', ') as categories
FROM robots r
LEFT JOIN manufacturers m ON r.manufacturer_id = m.id
LEFT JOIN robot_categories rc ON r.id = rc.robot_id
LEFT JOIN categories c ON rc.category_id = c.id
GROUP BY r.id, m.name, m.country;
```

#### 7.2 Search Index View
```sql
CREATE VIEW robot_search_index AS
SELECT 
    r.id,
    r.name,
    r.slug,
    r.description,
    r.features,
    r.applications,
    r.ai_capabilities,
    m.name as manufacturer_name,
    STRING_AGG(c.name, ' ') as category_names,
    STRING_AGG(s.name || ' ' || s.value, ' ') as specification_text
FROM robots r
LEFT JOIN manufacturers m ON r.manufacturer_id = m.id
LEFT JOIN robot_categories rc ON r.id = rc.robot_id
LEFT JOIN categories c ON rc.category_id = c.id
LEFT JOIN specifications s ON r.id = s.robot_id
GROUP BY r.id, r.name, r.slug, r.description, r.features, r.applications, r.ai_capabilities, m.name;
```

### 8. Performance Optimization

#### 8.1 Full-Text Search Configuration
```sql
-- Create full-text search index
CREATE INDEX idx_robot_search_fts ON robot_search_index 
USING gin(to_tsvector('english', 
    name || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(manufacturer_name, '') || ' ' ||
    COALESCE(category_names, '') || ' ' ||
    COALESCE(specification_text, '')
));

-- Search function
CREATE OR REPLACE FUNCTION search_robots(search_query TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rsi.id,
        rsi.name,
        rsi.slug,
        ts_rank(
            to_tsvector('english', 
                rsi.name || ' ' || 
                COALESCE(rsi.description, '') || ' ' ||
                COALESCE(rsi.manufacturer_name, '') || ' ' ||
                COALESCE(rsi.category_names, '')
            ),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM robot_search_index rsi
    WHERE to_tsvector('english', 
        rsi.name || ' ' || 
        COALESCE(rsi.description, '') || ' ' ||
        COALESCE(rsi.manufacturer_name, '') || ' ' ||
        COALESCE(rsi.category_names, '')
    ) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

#### 8.2 Database Maintenance
```sql
-- Vacuum and analyze schedule
-- Run weekly: VACUUM ANALYZE;
-- Run monthly: REINDEX DATABASE robostorm;

-- Update statistics for better query planning
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE robots;
    ANALYZE manufacturers;
    ANALYZE categories;
    ANALYZE reviews;
    ANALYZE specifications;
END;
$$ LANGUAGE plpgsql;
```

### 9. Database Migrations and Data Migration Strategy

#### 9.1 Migration File Location
**IMPORTANT**: All database migration files must be placed in the `supabase/migrations/` directory.

```
supabase/
├── migrations/                   # ALL database migration files go here
│   ├── 001_create_user_roles.sql
│   ├── 002_create_manufacturers.sql
│   ├── 003_create_robots.sql
│   ├── 004_create_categories.sql
│   ├── 005_create_specifications.sql
│   ├── 006_create_media.sql
│   ├── 007_create_reviews.sql
│   ├── 008_create_search_indexes.sql
│   └── ...
```

#### 9.2 Migration Best Practices
- **Sequential numbering**: Use `001_`, `002_`, `003_` format for proper ordering
- **Descriptive names**: Use clear, descriptive names like `create_robots_table`
- **One purpose per migration**: Each migration should handle one logical change
- **Include rollback notes**: Comment how to undo changes if needed
- **Use IF NOT EXISTS**: Prevent errors on re-runs
- **Test thoroughly**: Always test migrations on development environment first

#### 9.3 Migration Workflow
```bash
# Create new migration
supabase migration new create_robots_table

# Apply migrations
supabase db push

# Reset database (development only)
supabase db reset

# Check migration status
supabase migration list
```

#### 9.4 Initial Data Import
- **Manufacturers**: Import from robotics industry databases
- **Categories**: Define standard robot categories
- **Robots**: Import from manufacturer websites and robotics publications
- **Specifications**: Parse and import technical specifications

#### 9.5 Data Validation
```sql
-- Data validation functions
CREATE OR REPLACE FUNCTION validate_robot_data()
RETURNS TABLE (
    robot_id UUID,
    validation_errors TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        ARRAY_AGG(error_message) as errors
    FROM robots r
    CROSS JOIN LATERAL (
        SELECT CASE 
            WHEN r.name IS NULL OR r.name = '' THEN 'Name is required'
            WHEN r.height_cm IS NOT NULL AND r.height_cm <= 0 THEN 'Height must be positive'
            WHEN r.weight_kg IS NOT NULL AND r.weight_kg <= 0 THEN 'Weight must be positive'
            WHEN r.estimated_price_usd IS NOT NULL AND r.estimated_price_usd < 0 THEN 'Price cannot be negative'
        END as error_message
    ) validation
    WHERE error_message IS NOT NULL
    GROUP BY r.id
    HAVING COUNT(*) > 0;
END;
$$ LANGUAGE plpgsql;
```

### 10. Backup and Recovery

#### 10.1 Backup Strategy
- **Daily Incremental Backups**: Automated daily backups
- **Weekly Full Backups**: Complete database backup
- **Point-in-Time Recovery**: WAL archiving for precise recovery
- **Cross-Region Backup**: Backup replication to secondary region

#### 10.2 Recovery Procedures
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Testing**: Monthly disaster recovery testing

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** January 2025
