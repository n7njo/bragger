import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { 
  useAchievements, 
  useAchievement, 
  useCreateAchievement, 
  useUpdateAchievement, 
  useDeleteAchievement,
  achievementKeys 
} from './useAchievements'
import { mockAchievements } from '../test/mocks/handlers'

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAchievements hooks', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    wrapper = createWrapper()
  })

  describe('useAchievements', () => {
    it('should fetch achievements successfully', async () => {
      const { result } = renderHook(() => useAchievements(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toEqual(mockAchievements)
      expect(result.current.data?.total).toBe(mockAchievements.length)
    })

    it('should fetch achievements with filters', async () => {
      const filters = {
        search: 'React',
        categoryId: '1',
        priority: 'high' as const
      }

      const { result } = renderHook(() => useAchievements(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toEqual(mockAchievements)
    })

    it('should handle loading state', () => {
      const { result } = renderHook(() => useAchievements(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useAchievement', () => {
    it('should fetch single achievement', async () => {
      const { result } = renderHook(() => useAchievement('1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.data).toEqual(mockAchievements[0])
    })

    it('should handle achievement not found', async () => {
      const { result } = renderHook(() => useAchievement('999'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toContain('Achievement not found')
    })

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useAchievement(''), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useCreateAchievement', () => {
    it('should create achievement successfully', async () => {
      const { result } = renderHook(() => useCreateAchievement(), { wrapper })

      const newAchievement = {
        title: 'New Achievement',
        description: 'Test description',
        startDate: '2023-01-01',
        categoryId: '1',
        skillsUsed: ['React'],
        priority: 'medium' as const,
        tags: ['React']
      }

      result.current.mutate(newAchievement)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.data?.title).toBe(newAchievement.title)
    })

    it('should handle loading state during creation', async () => {
      const { result } = renderHook(() => useCreateAchievement(), { wrapper })

      const newAchievement = {
        title: 'New Achievement',
        description: 'Test description',
        startDate: '2023-01-01',
        categoryId: '1',
        skillsUsed: ['React'],
        priority: 'medium' as const,
        tags: ['React']
      }

      // Initially not pending
      expect(result.current.isPending).toBe(false)
      
      result.current.mutate(newAchievement)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      
      // After success, should not be pending
      expect(result.current.isPending).toBe(false)
    })
  })

  describe('useUpdateAchievement', () => {
    it('should update achievement successfully', async () => {
      const { result } = renderHook(() => useUpdateAchievement(), { wrapper })

      const updateData = {
        title: 'Updated Achievement',
        description: 'Updated description'
      }

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.message).toBe('Achievement updated successfully')
    })
  })

  describe('useDeleteAchievement', () => {
    it('should delete achievement successfully', async () => {
      const { result } = renderHook(() => useDeleteAchievement(), { wrapper })

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.message).toBe('Achievement deleted successfully')
    })
  })

  describe('Query keys', () => {
    it('should generate correct query keys', () => {
      expect(achievementKeys.all).toEqual(['achievements'])
      expect(achievementKeys.lists()).toEqual(['achievements', 'list'])
      expect(achievementKeys.list({ search: 'test' })).toEqual([
        'achievements', 
        'list', 
        { filters: { search: 'test' } }
      ])
      expect(achievementKeys.details()).toEqual(['achievements', 'detail'])
      expect(achievementKeys.detail('123')).toEqual(['achievements', 'detail', '123'])
    })
  })
})