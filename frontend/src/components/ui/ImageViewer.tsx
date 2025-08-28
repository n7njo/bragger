import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { AchievementImage } from '../../types'

interface ImageViewerProps {
  images: AchievementImage[]
  isOpen: boolean
  onClose: () => void
  initialImageIndex?: number
}

export function ImageViewer({ images, isOpen, onClose, initialImageIndex = 0 }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex)

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]
  const hasMultiple = images.length > 1

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/api/images/${currentImage.filename}`
    link.download = currentImage.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Info */}
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
          <p className="text-sm font-medium">{currentImage.originalName}</p>
          {hasMultiple && (
            <p className="text-xs opacity-75">
              {currentIndex + 1} of {images.length}
            </p>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-4 right-16 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
          title="Download image"
        >
          <Download className="h-5 w-5" />
        </button>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-colors"
              title="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-colors"
              title="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="max-w-full max-h-full p-8">
          <img
            src={`/api/images/${currentImage.filename}`}
            alt={currentImage.originalName}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Image Thumbnails */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex space-x-2 bg-black bg-opacity-50 p-2 rounded">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                    index === currentIndex 
                      ? 'border-white' 
                      : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  <img
                    src={`/api/images/${image.filename}`}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}