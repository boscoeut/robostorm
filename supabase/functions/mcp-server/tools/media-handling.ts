import { createClient } from '@supabase/supabase-js'

interface MediaUploadRequest {
  robotId: string
  file: File
  title?: string
  altText?: string
  caption?: string
  tags?: string[]
  isPrimary?: boolean
  isFeatured?: boolean
}

interface MediaUpdateRequest {
  mediaId: string
  title?: string
  altText?: string
  caption?: string
  tags?: string[]
  sortOrder?: number
  isPrimary?: boolean
  isFeatured?: boolean
}

interface MediaResponse {
  success: boolean
  data?: any
  error?: string
}

export class MediaHandlingTool {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Upload media file for a robot
   */
  async uploadMedia(request: MediaUploadRequest, userId: string): Promise<MediaResponse> {
    try {
      const { robotId, file, title, altText, caption, tags, isPrimary, isFeatured } = request

      // Validate file type and size
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
      const filePath = `robots/${robotId}/media/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('robot-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return { success: false, error: `Upload failed: ${uploadError.message}` }
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('robot-media')
        .getPublicUrl(filePath)

      // Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined
      if (file.type.startsWith('image/')) {
        const dimensions = await this.getImageDimensions(file)
        width = dimensions.width
        height = dimensions.height
      }

      // Create media record in database
      const mediaData = {
        robot_id: robotId,
        file_type: this.getFileType(file.type),
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size_bytes: file.size,
        mime_type: file.type,
        width,
        height,
        title: title || file.name,
        alt_text: altText || '',
        caption: caption || '',
        tags: tags || [],
        is_primary: isPrimary || false,
        is_featured: isFeatured || false,
        created_by: userId
      }

      const { data: mediaRecord, error: dbError } = await this.supabase
        .from('robot_media')
        .insert(mediaData)
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage
          .from('robot-media')
          .remove([filePath])
        
        return { success: false, error: `Database error: ${dbError.message}` }
      }

      // If this is set as primary, update robot's featured image
      if (isPrimary) {
        await this.supabase
          .from('robots')
          .update({ featured_image_url: urlData.publicUrl })
          .eq('id', robotId)
      }

      return { success: true, data: mediaRecord }

    } catch (error) {
      return { success: false, error: `Upload error: ${error.message}` }
    }
  }

  /**
   * Get media for a specific robot
   */
  async getRobotMedia(robotId: string): Promise<MediaResponse> {
    try {
      const { data, error } = await this.supabase
        .from('robot_media')
        .select('*')
        .eq('robot_id', robotId)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }

    } catch (error) {
      return { success: false, error: `Failed to fetch media: ${error.message}` }
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(request: MediaUpdateRequest, userId: string): Promise<MediaResponse> {
    try {
      const { mediaId, ...updateData } = request

      // Check if user has permission to update this media
      const { data: media, error: fetchError } = await this.supabase
        .from('robot_media')
        .select('*')
        .eq('id', mediaId)
        .single()

      if (fetchError) {
        return { success: false, error: 'Media not found' }
      }

      // Update media record
      const { data, error } = await this.supabase
        .from('robot_media')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediaId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // If setting as primary, update robot's featured image
      if (updateData.isPrimary) {
        await this.supabase
          .from('robot_media')
          .update({ is_primary: false })
          .eq('robot_id', media.robot_id)
          .neq('id', mediaId)

        await this.supabase
          .from('robots')
          .update({ featured_image_url: media.file_url })
          .eq('id', media.robot_id)
      }

      return { success: true, data }

    } catch (error) {
      return { success: false, error: `Update failed: ${error.message}` }
    }
  }

  /**
   * Delete media file
   */
  async deleteMedia(mediaId: string, userId: string): Promise<MediaResponse> {
    try {
      // Get media record first
      const { data: media, error: fetchError } = await this.supabase
        .from('robot_media')
        .select('*')
        .eq('id', mediaId)
        .single()

      if (fetchError) {
        return { success: false, error: 'Media not found' }
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('robot_media')
        .delete()
        .eq('id', mediaId)

      if (dbError) {
        return { success: false, error: dbError.message }
      }

      // Delete file from storage
      const filePath = this.extractFilePathFromUrl(media.file_url)
      if (filePath) {
        await this.supabase.storage
          .from('robot-media')
          .remove([filePath])
      }

      return { success: true, data: { id: mediaId } }

    } catch (error) {
      return { success: false, error: `Delete failed: ${error.message}` }
    }
  }

  /**
   * Set robot profile image
   */
  async setProfileImage(robotId: string, mediaId: string, userId: string): Promise<MediaResponse> {
    try {
      // Call the database function
      const { data, error } = await this.supabase
        .rpc('set_robot_profile_image', {
          robot_uuid: robotId,
          media_uuid: mediaId
        })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Failed to set profile image' }
      }

      return { success: true, data }

    } catch (error) {
      return { success: false, error: `Failed to set profile image: ${error.message}` }
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (100MB limit)
    if (file.size > 104857600) {
      return { valid: false, error: 'File size exceeds 100MB limit' }
    }

    // Check file type
    const allowedTypes = [
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

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' }
    }

    return { valid: true }
  }

  /**
   * Get file type category from MIME type
   */
  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType === 'application/pdf') return 'document'
    return 'document'
  }

  /**
   * Get image dimensions from file
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: 0, height: 0 })
      }
      
      img.src = url
    })
  }

  /**
   * Extract file path from storage URL
   */
  private extractFilePathFromUrl(url: string): string | null {
    const match = url.match(/robot-media\/(.+)$/)
    return match ? match[1] : null
  }
}

// Export for use in MCP server
export default MediaHandlingTool
