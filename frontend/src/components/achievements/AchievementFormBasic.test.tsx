import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { AchievementForm } from './AchievementForm'

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

describe('AchievementForm Basic', () => {
  let wrapper: ReturnType<typeof createWrapper>
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    wrapper = createWrapper()
    vi.clearAllMocks()
  })

  it('renders all form fields correctly', () => {
    render(
      <AchievementForm
        onSubmit={mockOnSubmit}
      />,
      { wrapper }
    )

    // Check that all required fields are present
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/skills used/i)).toBeInTheDocument()
    
    // Check submit button exists
    expect(screen.getByRole('button', { name: /save achievement/i })).toBeInTheDocument()
  })

  it('displays category options from API', () => {
    render(
      <AchievementForm onSubmit={mockOnSubmit} />,
      { wrapper }
    )

    const categorySelect = screen.getByLabelText(/category/i)
    expect(categorySelect).toBeInTheDocument()
    
    // Check that options are loaded
    expect(screen.getByRole('option', { name: 'Professional Development' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Personal Projects' })).toBeInTheDocument()
  })
})