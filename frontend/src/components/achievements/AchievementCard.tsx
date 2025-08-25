import { Calendar, Clock, Users } from 'lucide-react'
import { Achievement } from '../../types'
import { format } from 'date-fns'

interface AchievementCardProps {
  achievement: Achievement
  onClick?: () => void
}

export function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM yyyy')
    } catch {
      return dateString
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="mb-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {achievement.title}
          </h3>
          <div className="flex flex-col gap-1 ml-2">
            {achievement.category && (
              <span 
                className="text-xs px-2 py-1 rounded-full text-white text-center"
                style={{ backgroundColor: achievement.category.color || '#6B7280' }}
              >
                {achievement.category.name}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full text-center ${getPriorityColor(achievement.priority)}`}>
              {getPriorityLabel(achievement.priority)}
            </span>
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
        
        {achievement.teamSize && (
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            <span>Team of {achievement.teamSize}</span>
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
    </div>
  )
}