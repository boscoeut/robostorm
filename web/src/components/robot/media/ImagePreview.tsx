import React, { useState } from 'react'
import { Loader2, AlertCircle, Maximize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ImagePreviewProps {
  src: string
  alt: string
  className?: string
  showLightbox?: boolean
  onImageClick?: () => void
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  className = '',
  showLightbox = true,
  onImageClick,
  width,
  height,
  loading = 'lazy',
  priority = false
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState('loaded')
    const img = event.currentTarget
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    })
  }

  const handleImageError = () => {
    setImageState('error')
  }

  const handleClick = () => {
    if (showLightbox && imageState === 'loaded' && onImageClick) {
      onImageClick()
    }
  }

  const getAspectRatio = () => {
    if (!imageDimensions) return 'auto'
    const ratio = imageDimensions.width / imageDimensions.height
    
    if (ratio > 1.5) return 'landscape'
    if (ratio < 0.7) return 'portrait'
    return 'square'
  }


  if (imageState === 'error') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Loading State */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* Image */}
      <div
        className={`
          relative overflow-hidden rounded-lg transition-all duration-200
          ${showLightbox && imageState === 'loaded' ? 'cursor-pointer hover:scale-105' : ''}
          ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClick}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-200"
        />

        {/* Overlay for lightbox */}
        {showLightbox && imageState === 'loaded' && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
            <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Aspect Ratio Badge */}
        {imageState === 'loaded' && imageDimensions && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-black bg-opacity-50 text-white border-none"
            >
              {getAspectRatio()}
            </Badge>
          </div>
        )}

        {/* Dimensions Badge */}
        {imageState === 'loaded' && imageDimensions && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-black bg-opacity-50 text-white border-none"
            >
              {imageDimensions.width} × {imageDimensions.height}
            </Badge>
          </div>
        )}
      </div>

      {/* Image Info (shown on hover) */}
      {imageState === 'loaded' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs truncate">{alt}</p>
        </div>
      )}
    </div>
  )
}

// Hook for preloading images
export const useImagePreload = (src: string) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  React.useEffect(() => {
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => setError(true)
    img.src = src
  }, [src])

  return { loaded, error }
}

// Component for lazy loading with intersection observer
export const LazyImagePreview: React.FC<ImagePreviewProps & { threshold?: number }> = ({
  threshold = 0.1,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div ref={imgRef}>
      {isVisible ? (
        <ImagePreview {...props} />
      ) : (
        <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${props.className}`}>
          <div className="text-center p-4">
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}
