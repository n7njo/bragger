
import { CheckCircle, Circle, Target } from 'lucide-react';
import { Milestone } from '../../types';

interface MilestoneProgressProps {
  milestones: Milestone[];
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function MilestoneProgress({ milestones, size = 'md', showDetails = false }: MilestoneProgressProps) {
  const completedCount = milestones.filter(m => m.isCompleted).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (totalCount === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Target className={iconSizeClasses[size]} />
        <span className="text-sm">No milestones</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className={iconSizeClasses[size]} />
          <span className="text-sm font-medium text-gray-900">
            Progress
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {completedCount}/{totalCount}
        </span>
      </div>
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`bg-green-500 ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {showDetails && (
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{completedCount} completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Circle className="h-4 w-4 text-gray-400" />
            <span>{totalCount - completedCount} remaining</span>
          </div>
        </div>
      )}
      
      {progressPercentage === 100 && totalCount > 0 && (
        <div className="text-sm text-green-600 font-medium flex items-center space-x-1">
          <CheckCircle className="h-4 w-4" />
          <span>All milestones completed!</span>
        </div>
      )}
    </div>
  );
}