import React, { useState } from 'react';
import { Plus, Target, ArrowUpDown } from 'lucide-react';
import { Milestone, CreateMilestoneDto, UpdateMilestoneDto } from '../../types';
import { apiClient } from '../../services/api';
import { Button } from '../ui/Button';
import { MilestoneItem } from './MilestoneItem';
import { MilestoneForm } from './MilestoneForm';
import { MilestoneProgress } from './MilestoneProgress';

interface MilestoneListProps {
  achievementId: string;
  milestones: Milestone[];
  onMilestonesUpdate: (milestones: Milestone[]) => void;
}

export function MilestoneList({ achievementId, milestones, onMilestonesUpdate }: MilestoneListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const [sortBy, setSortBy] = useState<'order' | 'dueDate' | 'status'>('order');

  // Sort milestones based on current sort option
  const sortedMilestones = React.useMemo(() => {
    const sorted = [...milestones];
    
    switch (sortBy) {
      case 'dueDate':
        return sorted.sort((a, b) => {
          // Completed items go to bottom
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          
          // Then by due date (nulls last)
          if (!a.dueDate && !b.dueDate) return a.order - b.order;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      
      case 'status':
        return sorted.sort((a, b) => {
          // Incomplete first, then completed
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          
          // Then by order
          return a.order - b.order;
        });
      
      default: // 'order'
        return sorted.sort((a, b) => a.order - b.order);
    }
  }, [milestones, sortBy]);

  const handleCreateMilestone = async (data: CreateMilestoneDto) => {
    setIsLoading(true);
    try {
      const response = await apiClient.createMilestone(achievementId, data);
      if (response.success && response.data) {
        onMilestonesUpdate([...milestones, response.data]);
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMilestone = async (data: UpdateMilestoneDto) => {
    if (!editingMilestone) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.updateMilestone(achievementId, editingMilestone.id, data);
      if (response.success && response.data) {
        onMilestonesUpdate(
          milestones.map(m => m.id === editingMilestone.id ? response.data! : m)
        );
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    } finally {
      setIsLoading(false);
      setEditingMilestone(undefined);
    }
  };

  const handleToggleComplete = async (milestone: Milestone) => {
    setIsLoading(true);
    try {
      const updateData: UpdateMilestoneDto = {
        isCompleted: !milestone.isCompleted
      };
      
      const response = await apiClient.updateMilestone(achievementId, milestone.id, updateData);
      if (response.success && response.data) {
        onMilestonesUpdate(
          milestones.map(m => m.id === milestone.id ? response.data! : m)
        );
      }
    } catch (error) {
      console.error('Error toggling milestone completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestone: Milestone) => {
    setIsLoading(true);
    try {
      const response = await apiClient.deleteMilestone(achievementId, milestone.id);
      if (response.success) {
        onMilestonesUpdate(milestones.filter(m => m.id !== milestone.id));
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMilestone(undefined);
  };

  const handleFormSubmit = async (data: CreateMilestoneDto | UpdateMilestoneDto) => {
    if (editingMilestone) {
      await handleUpdateMilestone(data as UpdateMilestoneDto);
    } else {
      await handleCreateMilestone(data as CreateMilestoneDto);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Milestones ({milestones.length})
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {milestones.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm text-gray-600">Sort:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'order' | 'dueDate' | 'status')}
                className="text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="order">Order</option>
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
              </select>
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {milestones.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <MilestoneProgress milestones={milestones} size="md" showDetails />
        </div>
      )}

      {/* Milestone List */}
      {sortedMilestones.length > 0 ? (
        <div className="space-y-3">
          {sortedMilestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDeleteMilestone}
              isDraggable={sortBy === 'order'}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Target className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">No milestones yet</p>
          <p className="text-xs">Break down this achievement into smaller goals</p>
        </div>
      )}

      {/* Milestone Form Modal */}
      <MilestoneForm
        milestone={editingMilestone}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}