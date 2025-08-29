import { Request, Response } from 'express';
import { ApiResponse, PaginatedResponse, CreateAchievementDto, UpdateAchievementDto, AchievementFilters } from '../types';
import { AchievementService } from '../services/achievementService';

const achievementService = new AchievementService();

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    
    const filters: AchievementFilters = {
      userId: userId,
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags as string[] : [req.query.tags as string]) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as 'idea' | 'concept' | 'usable' | 'complete',
      sortBy: req.query.sortBy as 'title' | 'startDate' | 'createdAt' | 'status',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined,
    };

    const result = await achievementService.findAll(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements',
    });
  }
};

export const getAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Achievement ID is required',
      });
    }

    const achievement = await achievementService.findById(id, userId);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found',
      });
    }

    res.json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievement',
    });
  }
};

export const createAchievement = async (req: Request, res: Response) => {
  try {
    const data: CreateAchievementDto = req.body;
    const userId = (req as any).userId;
    
    const achievement = await achievementService.create(userId, data);
    
    res.status(201).json({
      success: true,
      data: achievement,
      message: 'Achievement created successfully',
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    
    // Handle validation errors
    if (error instanceof Error && (
      error.message.includes('required') ||
      error.message.includes('Invalid') ||
      error.message.includes('cannot be empty') ||
      error.message.includes('not found')
    )) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create achievement',
    });
  }
};

export const updateAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateAchievementDto = req.body;
    const userId = (req as any).userId;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Achievement ID is required',
      });
    }
    
    const achievement = await achievementService.update(id, userId, data);
    
    res.json({
      success: true,
      data: achievement,
      message: 'Achievement updated successfully',
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    
    // Handle validation and not found errors
    if (error instanceof Error) {
      if (error.message === 'Achievement not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      
      if (error.message.includes('required') ||
          error.message.includes('Invalid') ||
          error.message.includes('cannot be empty') ||
          error.message.includes('not found')) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update achievement',
    });
  }
};

export const deleteAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Achievement ID is required',
      });
    }
    
    await achievementService.delete(id, userId);
    
    res.json({
      success: true,
      message: 'Achievement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    
    if (error instanceof Error && error.message === 'Achievement not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete achievement',
    });
  }
};

export const uploadImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Handle file upload with multer and sharp
    
    res.json({
      success: true,
      data: [],
      message: 'Images uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
    });
  }
};