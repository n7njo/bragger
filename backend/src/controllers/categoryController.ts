import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilters } from '../types';

const categoryService = new CategoryService();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const filters: CategoryFilters = {
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
    };

    // Check if stats are requested
    const includeStats = req.query.includeStats === 'true';

    const result = includeStats 
      ? await categoryService.findAllWithStats(filters)
      : await categoryService.findAll(filters);

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
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await categoryService.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const createDto: CreateCategoryDto = {
      name: req.body.name,
      color: req.body.color,
    };

    const category = await categoryService.create(createDto);
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Handle validation errors
    if (error.message.includes('required') || 
        error.message.includes('already exists') || 
        error.message.includes('Invalid color format')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create category',
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateDto: UpdateCategoryDto = {
      name: req.body.name,
      color: req.body.color,
    };

    const category = await categoryService.update(id, updateDto);
    
    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating category:', error);

    // Handle not found errors
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.message.includes('cannot be empty') || 
        error.message.includes('already exists') || 
        error.message.includes('Invalid color format')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update category',
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await categoryService.delete(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);

    // Handle not found errors
    if (error.message === 'Category not found') {
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
      error: 'Failed to delete category',
    });
  }
};