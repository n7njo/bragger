import React, { useState, useEffect } from 'react';
import { Calendar, Save, X } from 'lucide-react';
import { Milestone, CreateMilestoneDto, UpdateMilestoneDto } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';

interface MilestoneFormProps {
  milestone?: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMilestoneDto | UpdateMilestoneDto) => Promise<void>;
  isLoading?: boolean;
}

export function MilestoneForm({ 
  milestone, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: MilestoneFormProps) {
  const [formData, setFormData] = useState<CreateMilestoneDto>({
    title: '',
    description: '',
    dueDate: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        setFormData({
          title: milestone.title,
          description: milestone.description || '',
          dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : undefined
        });
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: undefined
        });
      }
      setErrors({});
    }
  }, [isOpen, milestone]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateMilestoneDto | UpdateMilestoneDto = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting milestone:', error);
    }
  };

  const handleChange = (field: keyof CreateMilestoneDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={onClose}
              disabled={isLoading}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                {milestone ? 'Edit Milestone' : 'Add Milestone'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Enter milestone title"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <TextArea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dueDate"
                      value={formData.dueDate || ''}
                      onChange={(e) => handleChange('dueDate', e.target.value)}
                      disabled={isLoading}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {milestone ? 'Update' : 'Create'} Milestone
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}