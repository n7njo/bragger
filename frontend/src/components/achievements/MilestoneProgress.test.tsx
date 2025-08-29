import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MilestoneProgress } from './MilestoneProgress';
import { Milestone } from '../../types';

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Milestone 1',
    description: 'First milestone',
    isCompleted: true,
    order: 1,
    achievementId: 'achievement-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '2',
    title: 'Milestone 2',
    description: 'Second milestone',
    isCompleted: false,
    order: 2,
    achievementId: 'achievement-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Milestone 3',
    description: 'Third milestone',
    isCompleted: false,
    order: 3,
    achievementId: 'achievement-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('MilestoneProgress', () => {
  it('renders progress with correct completion ratio', () => {
    render(<MilestoneProgress milestones={mockMilestones} />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('renders empty state when no milestones', () => {
    render(<MilestoneProgress milestones={[]} />);
    
    expect(screen.getByText('No milestones')).toBeInTheDocument();
  });

  it('shows completion message when all milestones complete', () => {
    const completedMilestones = mockMilestones.map(m => ({ ...m, isCompleted: true }));
    render(<MilestoneProgress milestones={completedMilestones} showDetails />);
    
    expect(screen.getByText('All milestones completed!')).toBeInTheDocument();
  });

  it('shows details when showDetails is true', () => {
    render(<MilestoneProgress milestones={mockMilestones} showDetails />);
    
    expect(screen.getByText('1 completed')).toBeInTheDocument();
    expect(screen.getByText('2 remaining')).toBeInTheDocument();
  });
});