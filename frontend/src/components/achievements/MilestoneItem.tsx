import { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock,
  AlertTriangle,
  GripVertical
} from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import { Milestone } from '../../types';
import { Button } from '../ui/Button';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggleComplete: (milestone: Milestone) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
  isDraggable?: boolean;
  isLoading?: boolean;
}

export function MilestoneItem({ 
  milestone, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  isDraggable = false,
  isLoading = false
}: MilestoneItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate || milestone.isCompleted) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const nextWeek = addDays(now, 7);

    if (isBefore(due, now)) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (isBefore(due, tomorrow)) {
      return { status: 'due-today', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else if (isBefore(due, nextWeek)) {
      return { status: 'due-soon', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    }
    
    return null;
  };

  const dueDateStatus = getDueDateStatus(milestone.dueDate);

  const handleToggleComplete = () => {
    if (!isLoading) {
      onToggleComplete(milestone);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(milestone);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={`
        relative border border-gray-200 rounded-lg p-4 
        ${milestone.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}
        ${dueDateStatus?.bgColor ? dueDateStatus.bgColor : ''}
        transition-all duration-200 hover:shadow-sm
      `}>
        {/* Drag Handle */}
        {isDraggable && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}

        <div className={`flex items-start space-x-3 ${isDraggable ? 'ml-6' : ''}`}>
          {/* Completion Toggle */}
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`
              mt-1 flex-shrink-0 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
              ${milestone.isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}
            `}
          >
            {milestone.isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`
                  text-sm font-medium
                  ${milestone.isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'}
                `}>
                  {milestone.title}
                </h4>
                
                {milestone.description && (
                  <p className={`
                    mt-1 text-sm
                    ${milestone.isCompleted ? 'text-gray-500' : 'text-gray-600'}
                  `}>
                    {milestone.description}
                  </p>
                )}

                {/* Dates and Status */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  {milestone.dueDate && (
                    <div className={`
                      flex items-center space-x-1
                      ${dueDateStatus ? dueDateStatus.color : 'text-gray-500'}
                    `}>
                      <Calendar className="h-3 w-3" />
                      <span>Due {formatDate(milestone.dueDate)}</span>
                      {dueDateStatus?.status === 'overdue' && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                    </div>
                  )}

                  {milestone.completedAt && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Clock className="h-3 w-3" />
                      <span>Completed {formatDate(milestone.completedAt)}</span>
                    </div>
                  )}

                  {dueDateStatus && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${dueDateStatus.color} ${dueDateStatus.bgColor}
                    `}>
                      {dueDateStatus.status === 'overdue' && 'Overdue'}
                      {dueDateStatus.status === 'due-today' && 'Due Today'}
                      {dueDateStatus.status === 'due-soon' && 'Due Soon'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(milestone)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Milestone
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  className="sm:ml-3"
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}