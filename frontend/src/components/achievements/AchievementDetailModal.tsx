import { useEffect, useState } from 'react';
import { X, Calendar, Clock, ExternalLink, Tag, Code, Target, Folder } from 'lucide-react';
import { Achievement } from '../../types';
import { Button } from '../ui/Button';
import { ImageViewer } from '../ui/ImageViewer';
import { MilestoneProgress } from './MilestoneProgress';
import { MilestoneList } from './MilestoneList';
import { format } from 'date-fns';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (achievement: Achievement) => void;

}

const statusColors = {
  idea: 'bg-gray-100 text-gray-800',
  concept: 'bg-blue-100 text-blue-800',
  usable: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800',
};

const statusLabels = {
  idea: 'Idea',
  concept: 'Concept',
  usable: 'Usable',
  complete: 'Complete',
};

export function AchievementDetailModal({
  achievement,
  isOpen,
  onClose,
  onEdit,
}: AchievementDetailModalProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleMilestonesUpdate = (updatedMilestones: any[]) => {
    // This would normally update the achievement data
    console.log('Milestones updated:', updatedMilestones);
  };

  if (!isOpen || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
          {/* Header */}
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              {/* Title and Status */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold leading-6 text-gray-900 pr-8">
                  {achievement.title}
                </h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[achievement.status]}`}>
                  {statusLabels[achievement.status]}
                </span>
              </div>

              {/* Milestone Progress */}
              {achievement?.milestones && achievement.milestones.length > 0 && (
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <MilestoneProgress milestones={achievement.milestones} size="lg" showDetails />
                </div>
              )}

              {/* Description */}
              <div className="mt-4">
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
                  {achievement.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dates */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <span className="font-medium text-gray-700">Start Date:</span>
                      <span className="ml-2 text-gray-600">
                        {format(new Date(achievement.startDate), 'PPP')}
                      </span>
                    </div>
                  </div>

                  {achievement.endDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="font-medium text-gray-700">End Date:</span>
                        <span className="ml-2 text-gray-600">
                          {format(new Date(achievement.endDate), 'PPP')}
                        </span>
                      </div>
                    </div>
                  )}

                  {achievement.durationHours && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="ml-2 text-gray-600">
                          {achievement.durationHours} hours
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category and Links */}
                <div className="space-y-3">
                  {achievement.category && (
                    <div className="flex items-center text-sm">
                      <Folder className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <span
                          className="ml-2 px-2 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: achievement.category.color || '#6B7280' }}
                        >
                          {achievement.category.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {achievement.githubUrl && (
                    <div className="flex items-center text-sm">
                      <ExternalLink className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="font-medium text-gray-700">GitHub:</span>
                        <a
                          href={achievement.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Repository
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Impact */}
              {achievement.impact && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Impact</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {achievement.impact}
                  </p>
                </div>
              )}

              {/* Skills Used */}
              {achievement.skillsUsed && achievement.skillsUsed.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Code className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Skills Used</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {achievement.skillsUsed.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {achievement.tags && achievement.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Tag className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {achievement.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone List */}
              {achievement?.milestones && achievement.milestones.length > 0 && (
                <div className="mt-6">
                  <MilestoneList
                    achievementId={achievement?.id || ''}
                    milestones={achievement?.milestones || []}
                    onMilestonesUpdate={handleMilestonesUpdate}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {onEdit && (
                  <Button onClick={() => onEdit(achievement)}>
                    Edit Achievement
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={achievement.images || []}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        initialImageIndex={selectedImageIndex}
      />
    </div>
  );
}