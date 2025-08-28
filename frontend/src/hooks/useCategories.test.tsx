import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useCategories,
  useCreateCategory,
  categoryKeys
} from './useCategories'
import { mockCategories } from '../test/mocks/handlers'

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

describe('useCategories hooks', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    wrapper = createWrapper()
  })

  describe('useCategories', () => {
    it('should fetch categories successfully', async () => {
      const { result } = renderHook(() => useCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.data).toEqual(mockCategories)
    })

    it('should fetch categories with filters', async () => {
      const filters = {
        search: 'Professional',
        page: 1,
        pageSize: 10
      }

      const { result } = renderHook(() => useCategories(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toEqual(mockCategories)
    })
  })

  describe('useCreateCategory', () => {
    it('should create category successfully', async () => {
      const { result } = renderHook(() => useCreateCategory(), { wrapper })

      const newCategory = {
        name: 'New Category',
        color: '#FF5733'
      }

      result.current.mutate(newCategory)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.success).toBe(true)
      expect(result.current.data?.data?.name).toBe(newCategory.name)
      expect(result.current.data?.message).toBe('Category created successfully')
    })
  })

  describe('Query keys', () => {
    it('should generate correct query keys', () => {
      expect(categoryKeys.all).toEqual(['categories'])
      expect(categoryKeys.lists()).toEqual(['categories', 'list'])
      expect(categoryKeys.list({ search: 'test' })).toEqual([
        'categories', 
        'list', 
        { filters: { search: 'test' } }
      ])
      expect(categoryKeys.details()).toEqual(['categories', 'detail'])
      expect(categoryKeys.detail('123')).toEqual(['categories', 'detail', '123'])
    })
  })
})