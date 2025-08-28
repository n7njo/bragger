import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import { Button } from './Button'

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface ImageUploadProps {
  value?: ImageFile[]
  onChange?: (images: ImageFile[]) => void
  maxImages?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
  label?: string
  helperText?: string
  error?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false,
  label = 'Screenshots',
  helperText = 'Upload screenshots to showcase your achievement',
  error
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: ImageFile[] = []

    fileArray.forEach(file => {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`File ${file.name} is not a supported image type`)
        return
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${maxSize}MB limit`)
        return
      }

      // Check if we haven't reached the max images limit
      if (value.length + validFiles.length >= maxImages) {
        console.warn(`Maximum ${maxImages} images allowed`)
        return
      }

      // Create preview URL
      const preview = URL.createObjectURL(file)
      validFiles.push({
        file,
        preview,
        id: generateId()
      })
    })

    if (validFiles.length > 0 && onChange) {
      onChange([...value, ...validFiles])
    }
  }, [value, onChange, acceptedTypes, maxSize, maxImages])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [disabled, processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = useCallback((id: string) => {
    if (!onChange) return
    
    const updatedImages = value.filter(img => img.id !== id)
    // Revoke the preview URL to prevent memory leaks
    const imageToRemove = value.find(img => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    
    onChange(updatedImages)
  }, [value, onChange])

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {value.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded truncate">
                {image.file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragOver 
              ? 'border-primary-500 bg-primary-50' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            {dragOver ? (
              <div className="flex items-center space-x-2 text-primary-600">
                <Upload className="h-8 w-8" />
                <span className="text-lg font-medium">Drop images here</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  <ImageIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to {maxSize}MB ({maxImages - value.length} remaining)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add More Button */}
      {value.length > 0 && value.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add More Images ({maxImages - value.length} remaining)
        </Button>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}