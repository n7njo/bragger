import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AchievementDetailModal } from './AchievementDetailModal';
import { Achievement } from '../../types';

const mockAchievement: Achievement = {
  id: '1',
  title: 'Test Achievement',
  description: 'This is a test achievement description.',
  startDate: '2022-01-01',
  endDate: '2022-12-31',
  durationHours: 40,
  categoryId: '1',
  impact: 'Significant impact on the project.',
  skillsUsed: ['React', 'TypeScript', 'Node.js'],
  teamSize: 3,
  status: 'complete' as const,
  githubUrl: 'https://github.com/test/project',
  createdAt: '2022-01-01T00:00:00Z',
  updatedAt: '2022-12-31T23:59:59Z',
  category: {
    id: '1',
    name: 'Web Development',
    color: '#3B82F6',
    createdAt: '2022-01-01T00:00:00Z'
  },
  tags: [
    { id: '1', name: 'Frontend', createdAt: '2022-01-01T00:00:00Z' },
    { id: '2', name: 'Backend', createdAt: '2022-01-01T00:00:00Z' }
  ],
  images: [
    {
      id: '1',
      filename: 'test-image.jpg',
      originalName: 'test-image.jpg',
      filePath: '/uploads/test-image.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
      createdAt: '2022-01-01T00:00:00Z'
    }
  ]
};

describe('AchievementDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open with achievement data', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    expect(screen.getByText('This is a test achievement description.')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Test Achievement')).not.toBeInTheDocument();
  });

  it('does not render when achievement is null', () => {
    render(
      <AchievementDetailModal
        achievement={null}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Test Achievement')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit and onClose when edit button is clicked', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAchievement);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays impact section when impact is provided', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Impact')).toBeInTheDocument();
    expect(screen.getByText('Significant impact on the project.')).toBeInTheDocument();
  });

  it('displays timeline information correctly', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Started')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays metrics when provided', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Metrics')).toBeInTheDocument();
    expect(screen.getByText('40 hours')).toBeInTheDocument();
    expect(screen.getByText('3 people')).toBeInTheDocument();
  });

  it('displays GitHub link when provided', () => {
    render(
      <AchievementDetailModal
        achievement={mockAchievement}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Links')).toBeInTheDocument();
    const githubLink = screen.getByText('View on GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/test/project');
  });
});