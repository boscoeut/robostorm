import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { RobotMedia } from '@/types/database'

interface MediaGalleryProps {
  media: RobotMedia[]
  robotName: string
  className?: string
  showLightbox?: boolean
  maxItems?: number
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  robotName,
  className = '',
  showLightbox = true,
  maxItems
}) => {
  const [selectedMedia, setSelectedMedia] = useState<RobotMedia | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)

  // Filter and sort media
  const sortedMedia = media
    .sort((a, b) => {
      // Primary images first, then by sort order, then by creation date
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, maxItems)

  const openLightbox = (media: RobotMedia, index: number) => {
    if (!showLightbox) return
    setSelectedMedia(media)
    setCurrentIndex(index)
    setIsVideoPlaying(false)
    setIsVideoMuted(true)
  }

  const closeLightbox = () => {
    setSelectedMedia(null)
    setIsVideoPlaying(false)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + sortedMedia.length) % sortedMedia.length
      : (currentIndex + 1) % sortedMedia.length
    
    setCurrentIndex(newIndex)
    setSelectedMedia(sortedMedia[newIndex])
    setIsVideoPlaying(false)
    setIsVideoMuted(true)
  }

  const toggleVideoPlay = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  const toggleVideoMute = () => {
    setIsVideoMuted(!isVideoMuted)
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
        return '🖼️'
      case 'video':
        return '🎥'
      case 'document':
        return '📄'
      default:
        return '📎'
    }
  }

  if (sortedMedia.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">📷</div>
          <p className="text-gray-500">No media available for {robotName}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Media Gallery</h3>
            {maxItems && media.length > maxItems && (
              <Badge variant="secondary">
                Showing {maxItems} of {media.length}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedMedia.map((mediaItem, index) => (
              <div
                key={mediaItem.id}
                className={`
                  relative group cursor-pointer rounded-lg overflow-hidden
                  ${showLightbox ? 'hover:scale-105 transition-transform' : ''}
                `}
                onClick={() => openLightbox(mediaItem, index)}
              >
                {mediaItem.file_type === 'image' ? (
                  <img
                    src={mediaItem.file_url}
                    alt={mediaItem.alt_text || mediaItem.title || robotName}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                ) : mediaItem.file_type === 'video' ? (
                  <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <video
                      src={mediaItem.file_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl">{getMediaTypeIcon(mediaItem.file_type)}</span>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {mediaItem.file_type === 'video' && <Play className="h-6 w-6 text-white" />}
                    {mediaItem.file_type === 'image' && <Maximize className="h-6 w-6 text-white" />}
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {mediaItem.is_primary && (
                    <Badge variant="default" className="text-xs">Profile</Badge>
                  )}
                  {mediaItem.is_featured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                </div>
                
                {/* Title */}
                {mediaItem.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs truncate">{mediaItem.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Dialog open={!!selectedMedia} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          {selectedMedia && (
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Navigation Buttons */}
              {sortedMedia.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    onClick={() => navigateLightbox('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    onClick={() => navigateLightbox('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Media Content */}
              <div className="relative">
                {selectedMedia.file_type === 'image' ? (
                  <img
                    src={selectedMedia.file_url}
                    alt={selectedMedia.alt_text || selectedMedia.title || robotName}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                ) : selectedMedia.file_type === 'video' ? (
                  <div className="relative">
                    <video
                      src={selectedMedia.file_url}
                      className="w-full h-auto max-h-[80vh]"
                      controls={false}
                      autoPlay={isVideoPlaying}
                      muted={isVideoMuted}
                      loop
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                        onClick={toggleVideoPlay}
                      >
                        {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                        onClick={toggleVideoMute}
                      >
                        {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">{getMediaTypeIcon(selectedMedia.file_type)}</span>
                      <p className="text-lg font-medium">{selectedMedia.title}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedMedia.file_size_bytes || 0)}</p>
                      <Button asChild className="mt-4">
                        <a href={selectedMedia.file_url} target="_blank" rel="noopener noreferrer">
                          Download File
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Info */}
              <DialogHeader className="p-6 border-t">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-lg">{selectedMedia.title || selectedMedia.file_name}</DialogTitle>
                    {selectedMedia.caption && (
                      <p className="text-sm text-gray-600 mt-2">{selectedMedia.caption}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{selectedMedia.file_type.toUpperCase()}</span>
                      {selectedMedia.file_size_bytes && (
                        <span>{formatFileSize(selectedMedia.file_size_bytes)}</span>
                      )}
                      {selectedMedia.width && selectedMedia.height && (
                        <span>{selectedMedia.width} × {selectedMedia.height}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {selectedMedia.is_primary && <Badge variant="default">Profile</Badge>}
                    {selectedMedia.is_featured && <Badge variant="secondary">Featured</Badge>}
                  </div>
                </div>
              </DialogHeader>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
