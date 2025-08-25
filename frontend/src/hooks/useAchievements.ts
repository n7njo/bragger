import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../services/api'
import { 
  Achievement, 
  AchievementFilters, 
  CreateAchievementDto, 
  UpdateAchievementDto,
  AchievementResponse,
  ApiResponse 
} from '../types'

// Query keys for caching
export const achievementKeys = {
  all: ['achievements'] as const,
  lists: () => [...achievementKeys.all, 'list'] as const,
  list: (filters?: AchievementFilters) => [...achievementKeys.lists(), { filters }] as const,
  details: () => [...achievementKeys.all, 'detail'] as const,
  detail: (id: string) => [...achievementKeys.details(), id] as const,
}

// Fetch all achievements with optional filters
export function useAchievements(
  filters?: AchievementFilters,
  options?: UseQueryOptions<AchievementResponse<Achievement[]>>
) {
  return useQuery({
    queryKey: achievementKeys.list(filters),
    queryFn: () => apiClient.getAchievements(filters),
    ...options,
  })
}

// Fetch single achievement by ID
export function useAchievement(
  id: string,
  options?: UseQueryOptions<ApiResponse<Achievement>>
) {
  return useQuery({
    queryKey: achievementKeys.detail(id),
    queryFn: () => apiClient.getAchievement(id),
    enabled: !!id,
    ...options,
  })
}

// Create achievement mutation
export function useCreateAchievement(
  options?: UseMutationOptions<ApiResponse<Achievement>, Error, CreateAchievementDto>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAchievementDto) => apiClient.createAchievement(data),
    onSuccess: (data) => {
      // Invalidate and refetch achievements list
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
      
      // Add the new achievement to the cache
      if (data.data) {
        queryClient.setQueryData(
          achievementKeys.detail(data.data.id),
          data
        )
      }
    },
    ...options,
  })
}

// Update achievement mutation
export function useUpdateAchievement(
  options?: UseMutationOptions<ApiResponse<Achievement>, Error, { id: string; data: UpdateAchievementDto }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAchievementDto }) => 
      apiClient.updateAchievement(id, data),
    onSuccess: (data, variables) => {
      // Invalidate achievements list
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
      
      // Update the specific achievement in cache
      if (data.data) {
        queryClient.setQueryData(
          achievementKeys.detail(variables.id),
          data
        )
      }
    },
    ...options,
  })
}

// Delete achievement mutation
export function useDeleteAchievement(
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAchievement(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: achievementKeys.detail(deletedId) })
      
      // Invalidate lists to refetch without the deleted item
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
    },
    ...options,
  })
}

// Upload images mutation
export function useUploadImages(
  options?: UseMutationOptions<ApiResponse<string[]>, Error, { achievementId: string; files: FileList }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ achievementId, files }: { achievementId: string; files: FileList }) => 
      apiClient.uploadImages(achievementId, files),
    onSuccess: (_, variables) => {
      // Invalidate the specific achievement to refetch with new images
      queryClient.invalidateQueries({ 
        queryKey: achievementKeys.detail(variables.achievementId) 
      })
      
      // Also invalidate the achievements list in case images affect the display
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
    },
    ...options,
  })
}