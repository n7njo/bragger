import { Request, Response } from 'express';
import { prisma } from '../services/database';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../types';

export const getMilestones = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { achievementId } = req.params;

    // Verify achievement belongs to user
    const achievement = await prisma.achievement.findFirst({
      where: {
        id: achievementId,
        userId: userId
      }
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    const milestones = await prisma.milestone.findMany({
      where: {
        achievementId: achievementId,
        userId: userId
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Add computed isCompleted field
    const milestonesWithCompleted = milestones.map(milestone => ({
      ...milestone,
      isCompleted: !!milestone.completedAt
    }));

    res.json({
      success: true,
      data: milestonesWithCompleted
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createMilestone = async (req: Request<{ achievementId: string }, any, CreateMilestoneDto>, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { achievementId } = req.params;
    const { title, description, dueDate, order = 0 } = req.body;

    // Verify achievement belongs to user
    const achievement = await prisma.achievement.findFirst({
      where: {
        id: achievementId,
        userId: userId
      }
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        achievementId,
        userId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        order
      }
    });

    // Add computed isCompleted field
    const milestoneWithCompleted = {
      ...milestone,
      isCompleted: !!milestone.completedAt
    };

    res.status(201).json({
      success: true,
      data: milestoneWithCompleted,
      message: 'Milestone created successfully'
    });
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateMilestone = async (req: Request<{ achievementId: string; milestoneId: string }, any, UpdateMilestoneDto>, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { milestoneId } = req.params;
    const updateData = req.body;

    // Handle isCompleted field by converting to completedAt
    let dbUpdateData: any = {};
    
    // Copy regular fields
    if (updateData.title !== undefined) dbUpdateData.title = updateData.title;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.order !== undefined) dbUpdateData.order = updateData.order;
    
    // Handle isCompleted by converting to completedAt
    if ('isCompleted' in updateData) {
      dbUpdateData.completedAt = updateData.isCompleted ? new Date() : null;
    }
    
    // Handle date fields
    if (updateData.completedAt !== undefined) {
      dbUpdateData.completedAt = updateData.completedAt === null ? null : new Date(updateData.completedAt);
    }
    if (updateData.dueDate !== undefined) {
      dbUpdateData.dueDate = new Date(updateData.dueDate);
    }

    const milestone = await prisma.milestone.updateMany({
      where: {
        id: milestoneId,
        userId: userId
      },
      data: dbUpdateData
    });

    if (milestone.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }

    const updatedMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId }
    });

    // Add computed isCompleted field
    const milestoneWithCompleted = updatedMilestone ? {
      ...updatedMilestone,
      isCompleted: !!updatedMilestone.completedAt
    } : null;

    res.json({
      success: true,
      data: milestoneWithCompleted,
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteMilestone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { milestoneId } = req.params;

    const deletedMilestone = await prisma.milestone.deleteMany({
      where: {
        id: milestoneId,
        userId: userId
      }
    });

    if (deletedMilestone.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};