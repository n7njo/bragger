import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import { apiClient } from '../services/api'
import { 
  Category, 
  CategoryFilters,
  CreateCategoryDto, 
  UpdateCategoryDto,
  ApiResponse 
} from '../types'

// Query keys for caching
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: CategoryFilters) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

// Fetch all categories with optional filters
export function useCategories(
  filters?: CategoryFilters,
  options?: UseQueryOptions<ApiResponse<Category[]>>
) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => apiClient.getCategories(filters),
    ...options,
  })
}

// Fetch single category by ID
export function useCategory(
  id: string,
  options?: UseQueryOptions<ApiResponse<Category>>
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => apiClient.getCategory(id),
    enabled: !!id,
    ...options,
  })
}

// Create category mutation
export function useCreateCategory(
  options?: UseMutationOptions<ApiResponse<Category>, Error, CreateCategoryDto>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => apiClient.createCategory(data),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      
      // Add the new category to the cache
      if (data.data) {
        queryClient.setQueryData(
          categoryKeys.detail(data.data.id),
          data
        )
      }
    },
    ...options,
  })
}

// Update category mutation
export function useUpdateCategory(
  options?: UseMutationOptions<ApiResponse<Category>, Error, { id: string; data: UpdateCategoryDto }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => 
      apiClient.updateCategory(id, data),
    onSuccess: (data, variables) => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      
      // Update the specific category in cache
      if (data.data) {
        queryClient.setQueryData(
          categoryKeys.detail(variables.id),
          data
        )
      }
    },
    ...options,
  })
}

// Delete category mutation
export function useDeleteCategory(
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) })
      
      // Invalidate lists to refetch without the deleted item
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
    ...options,
  })
}