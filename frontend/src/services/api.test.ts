import { describe, it, expect } from 'vitest'
import { apiClient } from './api'
import { mockAchievements, mockCategories, mockTags } from '../test/mocks/handlers'

describe('ApiClient', () => {
  describe('Achievements', () => {
    it('should fetch achievements with correct format', async () => {
      const response = await apiClient.getAchievements()
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('total')
      expect(response).toHaveProperty('page')
      expect(response).toHaveProperty('pageSize')
      expect(response).toHaveProperty('totalPages')
      expect(response.data).toEqual(mockAchievements)
    })

    it('should fetch achievements with filters', async () => {
      const filters = {
        search: 'React',
        categoryId: '2',
        priority: 'high' as const,
        page: 1,
        pageSize: 10
      }
      
      const response = await apiClient.getAchievements(filters)
      expect(response.data).toEqual(mockAchievements)
    })

    it('should fetch single achievement', async () => {
      const response = await apiClient.getAchievement('1')
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual(mockAchievements[0])
    })

    it('should handle achievement not found', async () => {
      await expect(apiClient.getAchievement('999')).rejects.toThrow('Achievement not found')
    })

    it('should create achievement', async () => {
      const newAchievement = {
        title: 'New Achievement',
        description: 'Test description',
        startDate: '2023-01-01',
        categoryId: '1',
        skillsUsed: ['React'],
        status: 'concept' as const,
        tags: ['React']
      }

      const response = await apiClient.createAchievement(newAchievement)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.title).toBe(newAchievement.title)
      expect(response.message).toBe('Achievement created successfully')
    })

    it('should update achievement', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description'
      }

      const response = await apiClient.updateAchievement('1', updateData)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.message).toBe('Achievement updated successfully')
    })

    it('should delete achievement', async () => {
      const response = await apiClient.deleteAchievement('1')
      
      expect(response.success).toBe(true)
      expect(response.message).toBe('Achievement deleted successfully')
    })
  })

  describe('Categories', () => {
    it('should fetch categories', async () => {
      const response = await apiClient.getCategories()
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual(mockCategories)
    })

    it('should create category', async () => {
      const newCategory = {
        name: 'New Category',
        color: '#FF5733'
      }

      const response = await apiClient.createCategory(newCategory)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.name).toBe(newCategory.name)
      expect(response.message).toBe('Category created successfully')
    })
  })

  describe('Tags', () => {
    it('should fetch tags', async () => {
      const response = await apiClient.getTags()
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual(mockTags)
    })

    it('should create tag', async () => {
      const newTag = {
        name: 'New Tag'
      }

      const response = await apiClient.createTag(newTag)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.name).toBe(newTag.name)
      expect(response.message).toBe('Tag created successfully')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors with proper error structure', async () => {
      try {
        await apiClient.getAchievement('non-existent')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toContain('Achievement not found')
        }
      }
    })
  })
})