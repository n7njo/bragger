import { Request, Response } from 'express';
import { TagService } from '../services/tagService';
import { CreateTagDto, UpdateTagDto, TagFilters } from '../types';

const tagService = new TagService();

export const getTags = async (req: Request, res: Response) => {
  try {
    const filters: TagFilters = {
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
    };

    // Check if stats are requested
    const includeStats = req.query.includeStats === 'true';

    const result = includeStats 
      ? await tagService.findAllWithStats(filters)
      : await tagService.findAll(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
    });
  }
};

export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tag = await tagService.findById(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
      });
    }

    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag',
    });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const createDto: CreateTagDto = {
      name: req.body.name,
    };

    const tag = await tagService.create(createDto);
    
    res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag created successfully',
    });
  } catch (error: any) {
    console.error('Error creating tag:', error);
    
    // Handle validation errors
    if (error.message.includes('required') || 
        error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create tag',
    });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateDto: UpdateTagDto = {
      name: req.body.name,
    };

    const tag = await tagService.update(id, updateDto);
    
    res.json({
      success: true,
      data: tag,
      message: 'Tag updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating tag:', error);

    // Handle not found errors
    if (error.message === 'Tag not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.message.includes('cannot be empty') || 
        error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update tag',
    });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tagService.delete(id);
    
    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting tag:', error);

    // Handle not found errors
    if (error.message === 'Tag not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.message.includes('in use by achievements')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete tag',
    });
  }
};