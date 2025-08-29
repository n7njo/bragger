import { http, HttpResponse } from 'msw'
import { Achievement, Category, Tag } from '../../types'

const API_BASE_URL = 'http://localhost:3001/api'

// Mock data
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Professional Development',
    color: '#3B82F6',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2', 
    name: 'Personal Projects',
    color: '#10B981',
    createdAt: '2023-01-01T00:00:00.000Z'
  }
]

export const mockTags: Tag[] = [
  {
    id: '1',
    name: 'JavaScript',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'React',
    createdAt: '2023-01-01T00:00:00.000Z'
  }
]

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Built React Dashboard',
    description: 'Created a comprehensive dashboard for data visualization',
    startDate: '2023-01-01',
    endDate: '2023-01-15',
    durationHours: 80,
    categoryId: '2',
    impact: 'Improved team productivity by 30%',
    skillsUsed: ['React', 'TypeScript', 'D3.js'],
    teamSize: 3,
    status: 'complete',
    githubUrl: 'https://github.com/example/project',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    category: mockCategories[1],
    tags: [mockTags[1]],
    images: []
  }
]

export const handlers = [
  // Achievements
  http.get(`${API_BASE_URL}/achievements`, () => {
    return HttpResponse.json({
      data: mockAchievements,
      total: mockAchievements.length,
      page: 1,
      pageSize: 10,
      totalPages: 1
    })
  }),

  http.get(`${API_BASE_URL}/achievements/:id`, ({ params }) => {
    const achievement = mockAchievements.find(a => a.id === params.id)
    if (!achievement) {
      return HttpResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: achievement
    })
  }),

  http.post(`${API_BASE_URL}/achievements`, async ({ request }) => {
    const data = await request.json() as any
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: mockCategories.find(c => c.id === data.categoryId),
      tags: mockTags.filter(t => data.tags.includes(t.name)),
      images: []
    }
    
    return HttpResponse.json({
      success: true,
      data: newAchievement,
      message: 'Achievement created successfully'
    }, { status: 201 })
  }),

  http.put(`${API_BASE_URL}/achievements/:id`, async ({ params, request }) => {
    const data = await request.json() as any
    const achievement = mockAchievements.find(a => a.id === params.id)
    
    if (!achievement) {
      return HttpResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      )
    }

    const updatedAchievement = {
      ...achievement,
      ...data,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: updatedAchievement,
      message: 'Achievement updated successfully'
    })
  }),

  http.delete(`${API_BASE_URL}/achievements/:id`, ({ params }) => {
    const achievementExists = mockAchievements.some(a => a.id === params.id)
    
    if (!achievementExists) {
      return HttpResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Achievement deleted successfully'
    })
  }),

  // Categories
  http.get(`${API_BASE_URL}/categories`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCategories
    })
  }),

  http.post(`${API_BASE_URL}/categories`, async ({ request }) => {
    const data = await request.json() as any
    const newCategory: Category = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    }, { status: 201 })
  }),

  // Tags  
  http.get(`${API_BASE_URL}/tags`, () => {
    return HttpResponse.json({
      success: true,
      data: mockTags
    })
  }),

  http.post(`${API_BASE_URL}/tags`, async ({ request }) => {
    const data = await request.json() as any
    const newTag: Tag = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: newTag,
      message: 'Tag created successfully'
    }, { status: 201 })
  })
]