import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { AchievementForm } from './AchievementForm'
import { Achievement } from '../../types'

// Mock the hooks
vi.mock('../../hooks', () => ({
  useCategories: () => ({
    data: {
      success: true,
      data: [
        { id: '1', name: 'Professional Development', color: '#3B82F6' },
        { id: '2', name: 'Personal Projects', color: '#10B981' }
      ]
    },
    isLoading: false
  })
}))

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

describe('AchievementForm', () => {
  let wrapper: ReturnType<typeof createWrapper>
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    wrapper = createWrapper()
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <AchievementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { wrapper }
    )

    // Check required fields
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    
    // Check optional fields
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/team size/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/impact/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/skills used/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()

    // Check buttons
    expect(screen.getByText('Save Achievement')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('populates form with initial data', () => {
    const mockAchievement: Achievement = {
      id: '1',
      title: 'Test Achievement',
      description: 'Test description',
      startDate: '2023-01-01',
      endDate: '2023-01-15',
      durationHours: 40,
      categoryId: '1',
      impact: 'Test impact',
      skillsUsed: ['React', 'TypeScript'],
      teamSize: 3,
      priority: 'high',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      category: { id: '1', name: 'Professional Development', color: '#3B82F6', createdAt: '2023-01-01' },
      tags: [{ id: '1', name: 'Frontend', createdAt: '2023-01-01' }],
      images: []
    }

    render(
      <AchievementForm
        initialData={mockAchievement}
        onSubmit={mockOnSubmit}
      />,
      { wrapper }
    )

    expect(screen.getByDisplayValue('Test Achievement')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2023-01-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('40')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test impact')).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()

    render(
      <AchievementForm onSubmit={mockOnSubmit} />,
      { wrapper }
    )

    const submitButton = screen.getByText('Save Achievement')
    
    // Try to submit the form without filling required fields
    await user.click(submitButton)

    // Wait for validation to trigger
    await waitFor(() => {
      expect(screen.queryByText('Title is required') || 
             screen.queryByText('Title must be at least 3 characters')).toBeInTheDocument()
    })

    // Verify that form submission was prevented
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates date range correctly', async () => {
    const user = userEvent.setup()

    render(
      <AchievementForm onSubmit={mockOnSubmit} />,
      { wrapper }
    )

    // Fill in required fields with invalid date range
    await user.type(screen.getByLabelText(/title/i), 'Test Title')
    await user.type(screen.getByLabelText(/description/i), 'Test description with enough characters')
    await user.type(screen.getByLabelText(/start date/i), '2023-01-15')
    await user.type(screen.getByLabelText(/end date/i), '2023-01-01') // End before start
    
    // Add a skill
    const skillsInput = screen.getByPlaceholderText(/type skills and press enter/i)
    await user.type(skillsInput, 'React{Enter}')

    // Select category and priority
    await user.selectOptions(screen.getByLabelText(/category/i), '1')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'medium')

    await user.click(screen.getByText('Save Achievement'))

    await waitFor(() => {
      expect(screen.queryByText('End date must be after start date')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()

    render(
      <AchievementForm onSubmit={mockOnSubmit} />,
      { wrapper }
    )

    // Fill in all fields
    await user.type(screen.getByLabelText(/title/i), 'Test Achievement')
    await user.type(screen.getByLabelText(/description/i), 'This is a test achievement with enough description')
    await user.type(screen.getByLabelText(/start date/i), '2023-01-01')
    await user.type(screen.getByLabelText(/end date/i), '2023-01-15')
    await user.type(screen.getByLabelText(/duration/i), '40')
    await user.type(screen.getByLabelText(/team size/i), '3')
    await user.type(screen.getByLabelText(/impact/i), 'Great impact on the team')

    // Add skills
    const skillsInput = screen.getByPlaceholderText(/type skills and press enter/i)
    await user.type(skillsInput, 'React{Enter}')
    await user.type(skillsInput, 'TypeScript{Enter}')

    // Add tags
    const tagsInput = screen.getByPlaceholderText(/add tags to categorize/i)
    await user.type(tagsInput, 'Frontend{Enter}')
    await user.type(tagsInput, 'Development{Enter}')

    // Select category and priority
    await user.selectOptions(screen.getByLabelText(/category/i), '1')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')

    await user.click(screen.getByText('Save Achievement'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Achievement',
        description: 'This is a test achievement with enough description',
        startDate: '2023-01-01',
        endDate: '2023-01-15',
        durationHours: 40,
        categoryId: '1',
        impact: 'Great impact on the team',
        skillsUsed: ['React', 'TypeScript'],
        teamSize: 3,
        priority: 'high',
        tags: ['Frontend', 'Development']
      })
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <AchievementForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { wrapper }
    )

    await user.click(screen.getByText('Cancel'))

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables form when loading', () => {
    render(
      <AchievementForm
        onSubmit={mockOnSubmit}
        isLoading={true}
      />,
      { wrapper }
    )

    // Check that inputs are disabled
    expect(screen.getByLabelText(/title/i)).toBeDisabled()
    expect(screen.getByLabelText(/description/i)).toBeDisabled()
    expect(screen.getByText('Save Achievement')).toBeDisabled()
  })
})