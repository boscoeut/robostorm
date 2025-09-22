import React, { useState, useEffect } from 'react'
import { Check, Star, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import type { RobotMedia } from '@/types/database'

interface ProfileImageSelectorProps {
  robotId: string
  robotName: string
  currentProfileImageUrl?: string
  onProfileImageChange?: (mediaId: string, imageUrl: string) => void
  className?: string
}

export const ProfileImageSelector: React.FC<ProfileImageSelectorProps> = ({
  robotId,
  robotName,
  currentProfileImageUrl,
  onProfileImageChange,
  className = ''
}) => {
  const [media, setMedia] = useState<RobotMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

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
        .eq('file_type', 'image')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const setAsProfileImage = async (mediaId: string) => {
    try {
      setUpdating(mediaId)
      
      // Call the database function to set profile image
      const { data, error } = await supabase
        .rpc('set_robot_profile_image', {
          robot_uuid: robotId,
          media_uuid: mediaId
        })

      if (error) throw error

      if (data) {
        // Update local state
        setMedia(prev => prev.map(item => ({
          ...item,
          is_primary: item.id === mediaId
        })))

        // Get the media item to get the URL
        const mediaItem = media.find(m => m.id === mediaId)
        if (mediaItem && onProfileImageChange) {
          onProfileImageChange(mediaId, mediaItem.file_url)
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setUpdating(null)
    }
  }



  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Profile Image</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select an image to use as the profile image for {robotName}
        </p>
      </CardHeader>
      <CardContent>
        {media.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📷</div>
            <p className="text-gray-500 mb-4">No images available</p>
            <p className="text-sm text-gray-400">
              Upload some images first to select a profile image
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Profile Image */}
            {currentProfileImageUrl && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Profile Image</h4>
                <div className="flex items-center space-x-4 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <img
                    src={currentProfileImageUrl}
                    alt="Current profile"
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Badge variant="default" className="mb-1">Active</Badge>
                    <p className="text-sm text-gray-600">This image is currently displayed as the profile image</p>
                  </div>
                </div>
              </div>
            )}

            {/* Available Images */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Available Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.map((mediaItem) => (
                  <div
                    key={mediaItem.id}
                    className={`
                      relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                      ${mediaItem.is_primary 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }
                    `}
                    onClick={() => !mediaItem.is_primary && setAsProfileImage(mediaItem.id)}
                  >
                    <img
                      src={mediaItem.file_url}
                      alt={mediaItem.alt_text || mediaItem.title || robotName}
                      className="w-full h-24 object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className={`
                      absolute inset-0 flex items-center justify-center transition-all
                      ${mediaItem.is_primary 
                        ? 'bg-blue-500 bg-opacity-20' 
                        : 'bg-black bg-opacity-0 group-hover:bg-opacity-30'
                      }
                    `}>
                      {mediaItem.is_primary ? (
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                          <Check className="h-5 w-5" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary">
                            Set as Profile
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">
                        {mediaItem.title || mediaItem.file_name}
                      </p>
                      {mediaItem.width && mediaItem.height && (
                        <p className="text-white text-xs opacity-75">
                          {mediaItem.width} × {mediaItem.height}
                        </p>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {mediaItem.is_primary && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Profile
                        </Badge>
                      )}
                      {mediaItem.is_featured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Loading State */}
                    {updating === mediaItem.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">💡 Recommendations</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choose a high-quality image that clearly shows the robot</li>
                <li>• Square or portrait images work best for profile displays</li>
                <li>• Ensure good lighting and minimal background distractions</li>
                <li>• The image should be at least 400x400 pixels</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
