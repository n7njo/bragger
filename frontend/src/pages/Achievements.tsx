import React, { useState } from 'react';
import { Plus, Search, Filter, Trophy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAchievements } from '../hooks';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { LoadingGrid } from '../components/ui/LoadingCard';
import { ErrorState } from '../components/ui/ErrorState';
import { AchievementFilters } from '../types';

export function Achievements() {
  const [filters, setFilters] = useState<AchievementFilters>({
    page: 1,
    pageSize: 12
  })
  const [searchTerm, setSearchTerm] = useState('')

  const { 
    data: achievementsResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useAchievements(filters)

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

  const handleAchievementClick = (achievementId: string) => {
    console.log('Navigate to achievement:', achievementId)
    // TODO: Navigate to achievement detail page
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
          <Button className="flex items-center">
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
          <Button>
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
              onClick={() => handleAchievementClick(achievement.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}