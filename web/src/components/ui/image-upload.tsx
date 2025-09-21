import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

export interface ImageUploadProps {
  onUpload: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  maxSize?: number // in bytes
  className?: string
  disabled?: boolean
  placeholder?: string
}

export interface ImagePreviewProps {
  file: File
  onRemove: () => void
  className?: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove, className }) => {
  const [preview, setPreview] = useState<string>('')

  React.useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [file])

  return (
    <div className={cn('relative group', className)}>
      {preview && (
        <img
          src={preview}
          alt={file.name}
          className="w-full h-32 object-cover rounded-lg"
        />
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
        {file.name}
      </div>
    </div>
  )
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = false,
  accept = 'image/*',
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  placeholder = 'Drop images here or click to browse'
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)

  const validateFiles = useCallback((files: File[]): File[] => {
    return files.filter(file => {
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image`)
        return false
      }
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large`)
        return false
      }
      return true
    })
  }, [maxSize])

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = validateFiles(fileArray)
    
    if (multiple) {
      const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles)
      setSelectedFiles(newFiles)
      onUpload(newFiles)
    } else {
      setSelectedFiles(validFiles.slice(0, 1))
      onUpload(validFiles.slice(0, 1))
    }
  }, [multiple, selectedFiles, maxFiles, validateFiles, onUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onUpload(newFiles)
  }, [selectedFiles, onUpload])

  const clearAll = useCallback(() => {
    setSelectedFiles([])
    onUpload([])
  }, [onUpload])

  // Handle clipboard paste
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled) return
    
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          // Generate a filename for pasted images
          const timestamp = Date.now()
          const extension = file.type.split('/')[1] || 'png'
          const newFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
            type: file.type
          })
          imageFiles.push(newFile)
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault()
      const validFiles = validateFiles(imageFiles)
      if (validFiles.length > 0) {
        handleFiles(validFiles)
      }
    }
  }, [disabled, validateFiles, handleFiles])

  // Add paste event listener
  useEffect(() => {
    const uploadArea = uploadAreaRef.current
    if (!uploadArea) return

    uploadArea.addEventListener('paste', handlePaste)
    
    return () => {
      uploadArea.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        ref={uploadAreaRef}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled ? handleClick : undefined}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {placeholder}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can also paste images from clipboard (Ctrl+V)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max file size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
            {multiple && ` • Max files: ${maxFiles}`}
          </p>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Images ({selectedFiles.length})
            </h4>
            {multiple && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <ImagePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
