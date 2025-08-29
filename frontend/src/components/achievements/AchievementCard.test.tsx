import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AchievementCard } from './AchievementCard'
import { Achievement } from '../../types'

describe('AchievementCard', () => {
  const mockAchievement: Achievement = {
    id: '1',
    title: 'Test Achievement',
    description: 'This is a test achievement description that describes the work accomplished.',
    startDate: '2023-01-01',
    endDate: '2023-01-15',
    durationHours: 40,
    categoryId: '1',
    impact: 'Great impact on the team',
    skillsUsed: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    status: 'complete',
    githubUrl: 'https://github.com/example/test-project',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    category: {
      id: '1',
      name: 'Web Development',
      color: '#3B82F6',
      createdAt: '2023-01-01T00:00:00Z'
    },
    tags: [
      { id: '1', name: 'Frontend', createdAt: '2023-01-01T00:00:00Z' },
      { id: '2', name: 'Backend', createdAt: '2023-01-01T00:00:00Z' },
      { id: '3', name: 'Database', createdAt: '2023-01-01T00:00:00Z' },
      { id: '4', name: 'API', createdAt: '2023-01-01T00:00:00Z' }
    ],
    images: []
  }

  it('renders achievement information correctly', () => {
    render(<AchievementCard achievement={mockAchievement} />)

    // Check title and description
    expect(screen.getByText('Test Achievement')).toBeInTheDocument()
    expect(screen.getByText(/test achievement description/i)).toBeInTheDocument()
    
    // Check category
    expect(screen.getByText('Web Development')).toBeInTheDocument()
    
    // Check status
    expect(screen.getByText('Complete')).toBeInTheDocument()
    
    // Check that duration text exists
    expect(screen.getByText('40 hours')).toBeInTheDocument()
  })

   it('displays skills with overflow indicator', () => {
     render(<AchievementCard achievement={mockAchievement} />)

     // First 3 skills should be visible
     expect(screen.getByText('React')).toBeInTheDocument()
     expect(screen.getByText('TypeScript')).toBeInTheDocument()
     expect(screen.getByText('Node.js')).toBeInTheDocument()

     // Should show +1 more indicator for 4th skill
     const overflowIndicators = screen.getAllByText('+1 more')
     expect(overflowIndicators).toHaveLength(2) // One for skills, one for tags

     // 4th skill should not be directly visible
     expect(screen.queryByText('MongoDB')).not.toBeInTheDocument()
   })

   it('displays tags with overflow indicator', () => {
     render(<AchievementCard achievement={mockAchievement} />)

     // First 3 tags should be visible
     expect(screen.getByText('Frontend')).toBeInTheDocument()
     expect(screen.getByText('Backend')).toBeInTheDocument()
     expect(screen.getByText('Database')).toBeInTheDocument()

     // Should show +1 more indicator for 4th tag
     const overflowIndicators = screen.getAllByText('+1 more')
     expect(overflowIndicators).toHaveLength(2) // One for skills, one for tags

     // 4th tag should not be directly visible
     expect(screen.queryByText('API')).not.toBeInTheDocument()
   })

  it('handles achievement without optional fields', () => {
    const minimalAchievement: Achievement = {
      id: '2',
      title: 'Minimal Achievement',
      description: 'Basic description',
      startDate: '2023-01-01',
      categoryId: '1',
      skillsUsed: ['JavaScript'],
      status: 'idea',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      tags: [],
      images: []
    }

    render(<AchievementCard achievement={minimalAchievement} />)

    expect(screen.getByText('Minimal Achievement')).toBeInTheDocument()
    expect(screen.getByText('Basic description')).toBeInTheDocument()
    expect(screen.getByText('Idea')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    
    // Optional fields should not appear
    expect(screen.queryByText(/hours/)).not.toBeInTheDocument()
  })

  it('applies correct status colors', () => {
    const completeAchievement = { ...mockAchievement, status: 'complete' as const }
    const usableAchievement = { ...mockAchievement, status: 'usable' as const }
    const conceptAchievement = { ...mockAchievement, status: 'concept' as const }
    const ideaAchievement = { ...mockAchievement, status: 'idea' as const }

    const { rerender } = render(<AchievementCard achievement={completeAchievement} />)
    let statusBadge = screen.getByText('Complete')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')

    rerender(<AchievementCard achievement={usableAchievement} />)
    statusBadge = screen.getByText('Usable')
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')

    rerender(<AchievementCard achievement={conceptAchievement} />)
    statusBadge = screen.getByText('Concept')
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')

    rerender(<AchievementCard achievement={ideaAchievement} />)
    statusBadge = screen.getByText('Idea')
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('calls onClick handler when card is clicked', () => {
    const mockOnClick = vi.fn()
    
    render(
      <AchievementCard 
        achievement={mockAchievement} 
        onClick={mockOnClick} 
      />
    )

    const card = screen.getByText('Test Achievement').closest('.card')
    expect(card).toBeInTheDocument()
    
    fireEvent.click(card!)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('applies category color to badge', () => {
    render(<AchievementCard achievement={mockAchievement} />)
    
    const categoryBadge = screen.getByText('Web Development')
    expect(categoryBadge).toHaveStyle({ backgroundColor: '#3B82F6' })
  })
})