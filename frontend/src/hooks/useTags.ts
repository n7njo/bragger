import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../services/api'
import { 
  Tag, 
  TagFilters,
  CreateTagDto, 
  UpdateTagDto,
  ApiResponse 
} from '../types'

// Query keys for caching
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters?: TagFilters) => [...tagKeys.lists(), { filters }] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// Fetch all tags with optional filters
export function useTags(
  filters?: TagFilters,
  options?: UseQueryOptions<ApiResponse<Tag[]>>
) {
  return useQuery({
    queryKey: tagKeys.list(filters),
    queryFn: () => apiClient.getTags(filters),
    ...options,
  })
}

// Fetch single tag by ID
export function useTag(
  id: string,
  options?: UseQueryOptions<ApiResponse<Tag>>
) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => apiClient.getTag(id),
    enabled: !!id,
    ...options,
  })
}

// Create tag mutation
export function useCreateTag(
  options?: UseMutationOptions<ApiResponse<Tag>, Error, CreateTagDto>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTagDto) => apiClient.createTag(data),
    onSuccess: (data) => {
      // Invalidate and refetch tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      
      // Add the new tag to the cache
      if (data.data) {
        queryClient.setQueryData(
          tagKeys.detail(data.data.id),
          data
        )
      }
    },
    ...options,
  })
}

// Update tag mutation
export function useUpdateTag(
  options?: UseMutationOptions<ApiResponse<Tag>, Error, { id: string; data: UpdateTagDto }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) => 
      apiClient.updateTag(id, data),
    onSuccess: (data, variables) => {
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      
      // Update the specific tag in cache
      if (data.data) {
        queryClient.setQueryData(
          tagKeys.detail(variables.id),
          data
        )
      }
    },
    ...options,
  })
}

// Delete tag mutation
export function useDeleteTag(
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTag(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tagKeys.detail(deletedId) })
      
      // Invalidate lists to refetch without the deleted item
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
    ...options,
  })
}