import { Calendar, Clock, Edit2, Trash2, MoreVertical, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { Achievement } from '../../types'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import { ImageViewer } from '../ui/ImageViewer'

interface AchievementCardProps {
  achievement: Achievement
  onClick?: () => void
  onEdit?: (achievement: Achievement) => void
  onDelete?: (achievement: Achievement) => void
}

export function AchievementCard({ achievement, onClick, onEdit, onDelete }: AchievementCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM yyyy')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'usable':
        return 'bg-blue-100 text-blue-800'
      case 'concept':
        return 'bg-yellow-100 text-yellow-800'
      case 'idea':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (!e.defaultPrevented && onClick) {
      onClick()
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(achievement)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(achievement)
    }
  }

  const handleActionsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowActions(!showActions)
  }

  const handleImageClick = (e: React.MouseEvent, imageIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedImageIndex(imageIndex)
    setShowImageViewer(true)
  }

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
    >
      {/* Actions Menu */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 z-10" ref={actionsRef}>
          <button
            onClick={handleActionsClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="More actions"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[120px]">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col gap-2 flex-1 pr-8">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {achievement.title}
            </h3>
            <div className="flex gap-2">
              {achievement.category && (
                <span 
                  className="text-xs px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: achievement.category.color || '#6B7280' }}
                >
                  {achievement.category.name}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(achievement.status)}`}>
                {getStatusLabel(achievement.status)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {achievement.description}
        </p>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {formatDate(achievement.startDate)}
            {achievement.endDate && ` - ${formatDate(achievement.endDate)}`}
          </span>
        </div>
        
        {achievement.durationHours && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{achievement.durationHours} hours</span>
          </div>
        )}
        

        
        {achievement.githubUrl && (
          <div className="flex items-center text-xs text-gray-500">
            <ExternalLink className="h-3 w-3 mr-1" />
            <a 
              href={achievement.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View on GitHub
            </a>
          </div>
        )}
      </div>
      
      {achievement.skillsUsed && achievement.skillsUsed.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {achievement.skillsUsed.slice(0, 3).map((skill) => (
            <span 
              key={skill} 
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
          {achievement.skillsUsed.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{achievement.skillsUsed.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {/* Image Gallery Preview */}
      {achievement.images && achievement.images.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <ImageIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{achievement.images.length} image{achievement.images.length > 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {achievement.images.slice(0, 3).map((image, index) => (
              <div 
                key={image.id} 
                className="aspect-square bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => handleImageClick(e, index)}
                title="Click to view image"
              >
                <img
                  src={`/api/images/${image.filename}`}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {achievement.images.length > 3 && (
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">
                  +{achievement.images.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {achievement.tags && achievement.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {achievement.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag.id} 
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag.name}
            </span>
          ))}
          {achievement.tags.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{achievement.tags.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {/* Image Viewer Modal */}
      <ImageViewer
        images={achievement.images || []}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        initialImageIndex={selectedImageIndex}
      />
    </div>
  )
}