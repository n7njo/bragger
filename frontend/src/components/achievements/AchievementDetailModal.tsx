import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Achievement } from '../../types';
import { Button } from '../ui/Button';
import { ImageViewer } from '../ui/ImageViewer';
import { MilestoneProgress } from './MilestoneProgress';
import { MilestoneList } from './MilestoneList';

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