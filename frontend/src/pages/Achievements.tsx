import React, { useState } from 'react';
import { Plus, Search, Filter, Trophy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from '../hooks';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { AchievementForm } from '../components/achievements/AchievementForm';
import { AchievementDetailModal } from '../components/achievements/AchievementDetailModal';
import { LoadingGrid } from '../components/ui/LoadingCard';
import { ErrorState } from '../components/ui/ErrorState';
import { AchievementFilters, CreateAchievementDto, UpdateAchievementDto, Achievement } from '../types';

export function Achievements() {
  const [filters, setFilters] = useState<AchievementFilters>({
    page: 1,
    pageSize: 12
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const { 
    data: achievementsResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useAchievements(filters)

  const createAchievementMutation = useCreateAchievement()
  const updateAchievementMutation = useUpdateAchievement()
  const deleteAchievementMutation = useDeleteAchievement()

  const achievements = achievementsResponse?.data || []
  const totalCount = achievementsResponse?.total || 0

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm.trim() || undefined,
      page: 1
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
  }

  const handleCreateAchievement = async (data: CreateAchievementDto, images?: any[]) => {
    try {
      const result = await createAchievementMutation.mutateAsync(data)
      
      // If images are provided and achievement was created successfully, upload them
      if (images && images.length > 0 && result.data?.id) {
        const fileList = new DataTransfer()
        images.forEach(img => fileList.items.add(img.file))
        
        try {
          // Note: This will need the backend implementation to work
          // await uploadImagesMutation.mutateAsync({
          //   achievementId: result.data.id,
          //   files: fileList.files
          // })
          console.log('Images would be uploaded for achievement:', result.data.id)
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError)
          // Achievement was created successfully, but images failed
          // We could show a warning here
        }
      }
      
      setIsModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Error creating achievement:', error)
    }
  }

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement)
  }

  const handleUpdateAchievement = async (data: CreateAchievementDto, images?: any[]) => {
    if (!editingAchievement) {
      console.error('No achievement being edited')
      return
    }
    
    console.log('Updating achievement:', editingAchievement.id, 'with data:', data)
    
    try {
      // Convert CreateAchievementDto to UpdateAchievementDto
      const updateData: UpdateAchievementDto = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        durationHours: data.durationHours,
        categoryId: data.categoryId,
        impact: data.impact,
        skillsUsed: data.skillsUsed,

        status: data.status,
        githubUrl: data.githubUrl,
        tags: data.tags
      }
      
      const result = await updateAchievementMutation.mutateAsync({
        id: editingAchievement.id,
        data: updateData
      })
      
      console.log('Update successful:', result)
      
      // If images are provided, upload them
      if (images && images.length > 0) {
        const fileList = new DataTransfer()
        images.forEach(img => fileList.items.add(img.file))
        
        try {
          // Note: This will need the backend implementation to work
          console.log('Images would be uploaded for achievement:', editingAchievement.id)
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError)
        }
      }
      
      setEditingAchievement(null)
      refetch()
    } catch (error) {
      console.error('Error updating achievement:', error)
      alert('Error updating achievement. Please check the console for details.')
      // Don't close the modal on error so user can retry
    }
  }

  const handleDeleteAchievement = (achievement: Achievement) => {
    setDeletingAchievement(achievement)
  }

  const confirmDelete = async () => {
    if (!deletingAchievement) return
    
    try {
      await deleteAchievementMutation.mutateAsync(deletingAchievement.id)
      setDeletingAchievement(null)
      refetch()
    } catch (error) {
      console.error('Error deleting achievement:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
            <p className="mt-2 text-gray-600">
              Manage your professional accomplishments
              {totalCount > 0 && (
                <span className="ml-2 text-sm font-medium">({totalCount} total)</span>
              )}
            </p>
          </div>
          <Button className="flex items-center" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search achievements..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSearch}
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingGrid />}
      
      {isError && (
        <ErrorState
          title="Failed to load achievements"
          message={error?.message || 'An error occurred while loading your achievements.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.search ? 'No achievements found' : 'No achievements yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {filters.search 
              ? 'Try adjusting your search terms or filters.'
              : 'Start documenting your professional accomplishments to build your success story.'
            }
          </p>
          <Button onClick={() => filters.search ? setFilters({page: 1, pageSize: 12}) : setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {filters.search ? 'Clear Search' : 'Add Your First Achievement'}
          </Button>
        </div>
      )}

      {!isLoading && !isError && achievements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onClick={() => handleAchievementClick(achievement)}
              onEdit={handleEditAchievement}
              onDelete={handleDeleteAchievement}
            />
          ))}
        </div>
      )}

      {/* Add Achievement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Achievement"
        size="lg"
      >
        <AchievementForm
          onSubmit={handleCreateAchievement}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createAchievementMutation.isPending}
          submitLabel="Create Achievement"
        />
      </Modal>

      {/* Edit Achievement Modal */}
      <Modal
        isOpen={!!editingAchievement}
        onClose={() => setEditingAchievement(null)}
        title="Edit Achievement"
        size="lg"
      >
        {editingAchievement && (
          <AchievementForm
            initialData={editingAchievement}
            onSubmit={handleUpdateAchievement}
            onCancel={() => setEditingAchievement(null)}
            isLoading={updateAchievementMutation.isPending}
            submitLabel="Update Achievement"
          />
        )}
      </Modal>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        onEdit={handleEditAchievement}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAchievement}
        onClose={() => setDeletingAchievement(null)}
        title="Delete Achievement"
        size="sm"
      >
        {deletingAchievement && (
          <div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingAchievement.title}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingAchievement(null)}
                disabled={deleteAchievementMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteAchievementMutation.isPending}
                loading={deleteAchievementMutation.isPending}
              >
                Delete Achievement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}