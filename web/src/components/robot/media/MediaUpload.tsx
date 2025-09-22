import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, Image, Video, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface MediaUploadProps {
  robotId: string
  onUploadSuccess?: (media: any) => void
  onUploadError?: (error: string) => void
  className?: string
}

interface UploadFile extends File {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  robotId,
  onUploadSuccess,
  onUploadError,
  className = ''
}) => {
  const { user } = useAuth()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [metadata, setMetadata] = useState({
    title: '',
    altText: '',
    caption: '',
    tags: [] as string[],
    isPrimary: false,
    isFeatured: false
  })
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateFile(file)
      if (!validation.valid) {
        console.error('Invalid file:', validation.error)
        return false
      }
      return true
    })

    const newFiles: UploadFile[] = validFiles.map(file => {
      // Create a proper UploadFile that preserves File properties
      const uploadFile = Object.assign(file, {
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: 'pending' as const,
        preview: file.type && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      })
      return uploadFile as UploadFile
    })
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    // Check if user is authenticated
    if (!user) {
      onUploadError?.('You must be logged in to upload media')
      return
    }

    setIsUploading(true)
    
    try {
      const uploadPromises = files.map(async (file) => {
        try {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploading' } : f
          ))

          // Upload to Supabase Storage
          const timestamp = Date.now()
          const fileExtension = file.name ? file.name.split('.').pop() : 'bin'
          const safeFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : `file_${timestamp}`
          const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
          const filePath = `robots/${robotId}/media/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('robot-media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) throw uploadError

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('robot-media')
            .getPublicUrl(filePath)

          // Get image dimensions if it's an image
          let width: number | undefined
          let height: number | undefined
          if (file.type && file.type.startsWith('image/')) {
            const dimensions = await getImageDimensions(file)
            width = dimensions.width
            height = dimensions.height
          }

          // Create media record in database
          const mediaData = {
            robot_id: robotId,
            file_type: getFileType(file.type),
            file_name: safeFileName,
            file_url: urlData.publicUrl,
            file_size_bytes: file.size,
            mime_type: file.type,
            width,
            height,
            title: metadata.title || safeFileName,
            alt_text: metadata.altText || '',
            caption: metadata.caption || '',
            tags: metadata.tags,
            is_primary: metadata.isPrimary,
            is_featured: metadata.isFeatured,
            created_by: user.id
          }

          const { data: mediaRecord, error: dbError } = await supabase
            .from('robot_media')
            .insert(mediaData)
            .select()
            .single()

          if (dbError) throw dbError

          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
          ))

          return mediaRecord
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error'
            } : f
          ))
          throw error
        }
      })

      const results = await Promise.all(uploadPromises)
      onUploadSuccess?.(results)
      
      // Clear files and metadata after successful upload
      setFiles([])
      setMetadata({
        title: '',
        altText: '',
        caption: '',
        tags: [],
        isPrimary: false,
        isFeatured: false
      })

    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsUploading(false)
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
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

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check if file exists and has a name
    if (!file || !file.name) {
      return { valid: false, error: 'Invalid file: missing file name' }
    }

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

  const getFileType = (mimeType: string): string => {
    if (!mimeType) return 'document'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType === 'application/pdf') return 'document'
    return 'document'
  }

  const getFileIcon = (file: File) => {
    if (file.type && file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type && file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You must be logged in to upload media files.
          </p>
          <p className="text-sm text-gray-500">
            Please sign in to continue.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
              hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to select files
            </p>
            <p className="text-xs text-gray-400">
              Supports: Images (JPEG, PNG, WebP, GIF), Videos (MP4, WebM), PDFs
            </p>
            <p className="text-xs text-gray-400">
              Max file size: 100MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Files to Upload</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name || 'Uploaded file'}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name || 'Unknown file'}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size || 0)}</p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2" />
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {file.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Form */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Media Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter media title"
                />
              </div>
              
              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={metadata.altText}
                  onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={metadata.caption}
                  onChange={(e) => setMetadata(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Optional caption"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={metadata.isPrimary}
                    onChange={(e) => setMetadata(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  />
                  <span className="text-sm">Set as profile image</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={metadata.isFeatured}
                    onChange={(e) => setMetadata(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={uploadFiles}
            disabled={isUploading || files.some(f => f.status === 'uploading')}
            className="min-w-32"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  )
}
