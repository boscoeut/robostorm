-- Migration: Create Robot Media Storage
-- Description: Sets up Supabase Storage bucket and policies for robot media uploads
-- Dependencies: Requires 002_create_robot_database_tables.sql to be applied first
-- Author: RoboStorm Development Team
-- Date: 2025-01-27

-- ============================================================================
-- STORAGE BUCKET CREATION
-- ============================================================================

-- Create the robot-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'robot-media',
    'robot-media',
    true, -- Public read access
    104857600, -- 100MB file size limit
    ARRAY[
        'image/jpeg',
        'image/png', 
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'application/pdf',
        'text/plain'
    ]
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access to robot media files
CREATE POLICY "Public robot media read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'robot-media');

-- Policy 2: Admin-only upload access to robot media
CREATE POLICY "Admin robot media upload access" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'robot-media' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy 3: Admin-only update access to robot media
CREATE POLICY "Admin robot media update access" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'robot-media' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy 4: Admin-only delete access to robot media
CREATE POLICY "Admin robot media delete access" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'robot-media' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- ============================================================================
-- STORAGE FUNCTIONS
-- ============================================================================

-- Function to get robot media URLs
CREATE OR REPLACE FUNCTION get_robot_media_urls(robot_uuid UUID)
RETURNS TABLE (
    id UUID,
    file_name VARCHAR,
    file_url TEXT,
    thumbnail_url TEXT,
    file_type VARCHAR,
    file_size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    is_primary BOOLEAN,
    is_featured BOOLEAN,
    sort_order INTEGER,
    title VARCHAR,
    alt_text TEXT,
    caption TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rm.id,
        rm.file_name,
        rm.file_url,
        rm.thumbnail_url,
        rm.file_type,
        rm.file_size_bytes,
        rm.width,
        rm.height,
        rm.is_primary,
        rm.is_featured,
        rm.sort_order,
        rm.title,
        rm.alt_text,
        rm.caption
    FROM robot_media rm
    WHERE rm.robot_id = robot_uuid
    ORDER BY rm.is_primary DESC, rm.sort_order ASC, rm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set robot profile image
CREATE OR REPLACE FUNCTION set_robot_profile_image(
    robot_uuid UUID,
    media_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    media_exists BOOLEAN;
    robot_exists BOOLEAN;
BEGIN
    -- Check if media exists and belongs to the robot
    SELECT EXISTS(
        SELECT 1 FROM robot_media 
        WHERE id = media_uuid AND robot_id = robot_uuid
    ) INTO media_exists;
    
    IF NOT media_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Check if robot exists
    SELECT EXISTS(
        SELECT 1 FROM robots 
        WHERE id = robot_uuid
    ) INTO robot_exists;
    
    IF NOT robot_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Unset all other primary images for this robot
    UPDATE robot_media 
    SET is_primary = FALSE 
    WHERE robot_id = robot_uuid;
    
    -- Set the selected media as primary
    UPDATE robot_media 
    SET is_primary = TRUE 
    WHERE id = media_uuid AND robot_id = robot_uuid;
    
    -- Update the robot's featured_image_url
    UPDATE robots 
    SET featured_image_url = (
        SELECT file_url FROM robot_media WHERE id = media_uuid
    )
    WHERE id = robot_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete robot media (with storage cleanup)
CREATE OR REPLACE FUNCTION delete_robot_media(media_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    media_record RECORD;
    file_path TEXT;
BEGIN
    -- Get media record
    SELECT * INTO media_record FROM robot_media WHERE id = media_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Extract file path from URL for storage deletion
    -- Assuming URLs are in format: https://[domain]/storage/v1/object/public/robot-media/robots/[robot_id]/media/[filename]
    file_path := regexp_replace(media_record.file_url, '^.*robot-media/', '');
    
    -- Delete from storage (this will be handled by the application layer)
    -- For now, just delete the database record
    DELETE FROM robot_media WHERE id = media_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR ROBOT MEDIA
-- ============================================================================

-- Function to validate media file types
CREATE OR REPLACE FUNCTION validate_robot_media()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate file type
    IF NEW.file_type NOT IN ('image', 'video', 'document', '3d_model', 'datasheet') THEN
        RAISE EXCEPTION 'Invalid file type: %', NEW.file_type;
    END IF;
    
    -- Validate file size (100MB limit)
    IF NEW.file_size_bytes > 104857600 THEN
        RAISE EXCEPTION 'File size exceeds 100MB limit';
    END IF;
    
    -- Validate image dimensions if it's an image
    IF NEW.file_type = 'image' THEN
        IF NEW.width IS NULL OR NEW.height IS NULL THEN
            RAISE EXCEPTION 'Image dimensions are required for image files';
        END IF;
        
        -- Reasonable image size limits
        IF NEW.width > 8000 OR NEW.height > 8000 THEN
            RAISE EXCEPTION 'Image dimensions too large (max 8000x8000)';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
CREATE TRIGGER validate_robot_media_trigger
    BEFORE INSERT OR UPDATE ON robot_media
    FOR EACH ROW EXECUTE FUNCTION validate_robot_media();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for robot_media table
CREATE INDEX IF NOT EXISTS idx_robot_media_robot_primary ON robot_media(robot_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_robot_media_robot_featured ON robot_media(robot_id, is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_robot_media_created_by ON robot_media(created_by);
CREATE INDEX IF NOT EXISTS idx_robot_media_file_type ON robot_media(file_type);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_robot_media_urls(UUID) IS 'Returns all media files for a specific robot with URLs and metadata';
COMMENT ON FUNCTION set_robot_profile_image(UUID, UUID) IS 'Sets a specific media file as the profile image for a robot';
COMMENT ON FUNCTION delete_robot_media(UUID) IS 'Deletes robot media record and handles cleanup';

COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads - robot-media bucket configured for admin uploads and public reads';

