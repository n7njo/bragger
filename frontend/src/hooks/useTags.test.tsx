import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { 
  useTags, 
  useTag, 
  useCreateTag, 
  useUpdateTag, 
  useDeleteTag,
  tagKeys 
} from './useTags'
import { mockTags } from '../test/mocks/handlers'

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

describe('useTags hooks', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    wrapper = createWrapper()
  })

  describe('useTags', () => {
    it('should fetch tags successfully', async () => {
      const { result } = renderHook(() => useTags(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.data).toEqual(mockTags)
    })

    it('should fetch tags with filters', async () => {
      const filters = {
        search: 'React',
        page: 1,
        pageSize: 10
      }

      const { result } = renderHook(() => useTags(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toEqual(mockTags)
    })
  })

  describe('useCreateTag', () => {
    it('should create tag successfully', async () => {
      const { result } = renderHook(() => useCreateTag(), { wrapper })

      const newTag = {
        name: 'New Tag'
      }

      result.current.mutate(newTag)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.data?.name).toBe(newTag.name)
      expect(result.current.data?.message).toBe('Tag created successfully')
    })
  })

  describe('Query keys', () => {
    it('should generate correct query keys', () => {
      expect(tagKeys.all).toEqual(['tags'])
      expect(tagKeys.lists()).toEqual(['tags', 'list'])
      expect(tagKeys.list({ search: 'test' })).toEqual([
        'tags', 
        'list', 
        { filters: { search: 'test' } }
      ])
      expect(tagKeys.details()).toEqual(['tags', 'detail'])
      expect(tagKeys.detail('123')).toEqual(['tags', 'detail', '123'])
    })
  })
})