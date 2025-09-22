import React, { useState, useEffect } from 'react'
import { Trash2, Edit, Image, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MediaUpload } from './MediaUpload'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { RobotMedia } from '@/types/database'

interface MediaManagerProps {
  robotId: string
  robotName: string
  className?: string
}

interface EditMediaData {
  id: string
  title: string
  altText: string
  caption: string
  tags: string[]
  isPrimary: boolean
  isFeatured: boolean
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  robotId,
  robotName,
  className = ''
}) => {
  const { user } = useAuth()
  const [media, setMedia] = useState<RobotMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMedia, setEditingMedia] = useState<EditMediaData | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    loadMedia()
  }, [robotId])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('robot_media')
        .select('*')
        .eq('robot_id', robotId)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (newMedia: RobotMedia[]) => {
    setMedia(prev => [...newMedia, ...prev])
    setShowUpload(false)
  }

  const handleUploadError = (error: string) => {
    setError(error)
  }

  const updateMedia = async (mediaId: string, updates: Partial<EditMediaData>) => {
    if (!user) {
      setError('You must be logged in to update media')
      return
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.altText !== undefined) updateData.alt_text = updates.altText
      if (updates.caption !== undefined) updateData.caption = updates.caption
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary
      if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured

      const { error } = await supabase
        .from('robot_media')
        .update(updateData)
        .eq('id', mediaId)

      if (error) throw error

      // If setting as primary, unset others and update robot's featured image
      if (updates.isPrimary) {
        await supabase
          .from('robot_media')
          .update({ is_primary: false })
          .eq('robot_id', robotId)
          .neq('id', mediaId)

        const mediaItem = media.find(m => m.id === mediaId)
        if (mediaItem) {
          await supabase
            .from('robots')
            .update({ featured_image_url: mediaItem.file_url })
            .eq('id', robotId)
        }
      }

      // Reload media to get updated data
      await loadMedia()
      setEditingMedia(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const deleteMedia = async (mediaId: string) => {
    if (!user) {
      setError('You must be logged in to delete media')
      return
    }

    try {
      const mediaItem = media.find(m => m.id === mediaId)
      if (!mediaItem) return

      // Delete from database
      const { error: dbError } = await supabase
        .from('robot_media')
        .delete()
        .eq('id', mediaId)

      if (dbError) throw dbError

      // Delete file from storage
      const filePath = extractFilePathFromUrl(mediaItem.file_url)
      if (filePath) {
        await supabase.storage
          .from('robot-media')
          .remove([filePath])
      }

      // Remove from local state
      setMedia(prev => prev.filter(m => m.id !== mediaId))
      setDeleteConfirmId(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const extractFilePathFromUrl = (url: string): string | null => {
    const match = url.match(/robot-media\/(.+)$/)
    return match ? match[1] : null
  }

  const startEdit = (mediaItem: RobotMedia) => {
    setEditingMedia({
      id: mediaItem.id,
      title: mediaItem.title || '',
      altText: mediaItem.alt_text || '',
      caption: mediaItem.caption || '',
      tags: mediaItem.tags || [],
      isPrimary: mediaItem.is_primary,
      isFeatured: mediaItem.is_featured
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null || bytes === 0) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMediaTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return '🎥'
      case 'document':
        return '📄'
      default:
        return '📎'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Manager</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage media files for {robotName}
              </p>
            </div>
            <Button 
              onClick={() => setShowUpload(true)}
              disabled={!user}
              title={!user ? 'You must be logged in to upload media' : 'Upload media files'}
            >
              Upload Media
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      {showUpload && (
        <MediaUpload
          robotId={robotId}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      )}

      {/* Media List */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files ({media.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📷</div>
              <p className="text-gray-500 mb-4">No media files uploaded yet</p>
              <Button onClick={() => setShowUpload(true)}>
                Upload First Media
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {media.map((mediaItem) => (
                <div key={mediaItem.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {mediaItem.file_type === 'image' ? (
                      <img
                        src={mediaItem.file_url}
                        alt={mediaItem.alt_text || mediaItem.title || ''}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        {getMediaTypeIcon(mediaItem.file_type)}
                      </div>
                    )}
                  </div>

                  {/* Media Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium truncate">{mediaItem.title || mediaItem.file_name}</p>
                      {mediaItem.is_primary && <Badge variant="default">Profile</Badge>}
                      {mediaItem.is_featured && <Badge variant="secondary">Featured</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">
                      {mediaItem.file_type.toUpperCase()} • {formatFileSize(mediaItem.file_size_bytes)}
                      {mediaItem.width && mediaItem.height && ` • ${mediaItem.width} × ${mediaItem.height}`}
                    </p>
                    {mediaItem.caption && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{mediaItem.caption}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(mediaItem)}
                      disabled={!user}
                      title={!user ? 'You must be logged in to edit media' : 'Edit media'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(mediaItem.id)}
                      disabled={!user}
                      title={!user ? 'You must be logged in to delete media' : 'Delete media'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>
          {editingMedia && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingMedia.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMedia(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-alt">Alt Text</Label>
                <Input
                  id="edit-alt"
                  value={editingMedia.altText}
                  onChange={(e) => setEditingMedia(prev => prev ? { ...prev, altText: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                  id="edit-caption"
                  value={editingMedia.caption}
                  onChange={(e) => setEditingMedia(prev => prev ? { ...prev, caption: e.target.value } : null)}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingMedia.isPrimary}
                    onChange={(e) => setEditingMedia(prev => prev ? { ...prev, isPrimary: e.target.checked } : null)}
                  />
                  <span className="text-sm">Profile Image</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingMedia.isFeatured}
                    onChange={(e) => setEditingMedia(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMedia(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingMedia && updateMedia(editingMedia.id, editingMedia)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this media file? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && deleteMedia(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
