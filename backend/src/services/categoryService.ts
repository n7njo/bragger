import { Prisma } from '@prisma/client';
import { prisma } from './database';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryFilters,
  CategoryWithStats,
  PaginatedResponse,
  Category
} from '../types';

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: { achievements: true };
    };
  };
}>;

export class CategoryService {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    // Validate input data
    this.validateCreateData(data);

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name }
    });

    if (existingCategory) {
      throw new Error('Category name already exists');
    }

    // Create category
    return prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
      }
    });
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id }
    });
  }

  /**
   * Find all categories with filtering and pagination
   */
  async findAll(filters: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where = this.buildWhereClause(filters);

    // Build query options
    const queryOptions: any = {
      orderBy: { name: 'asc' },
      skip,
      take: pageSize
    };

    // Only add where clause if it has conditions
    if (Object.keys(where).length > 0) {
      queryOptions.where = where;
    }

    // Execute queries
    const [data, total] = await Promise.all([
      prisma.category.findMany(queryOptions),
      prisma.category.count(Object.keys(where).length > 0 ? { where } : undefined)
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Find all categories with achievement counts
   */
  async findAllWithStats(filters: CategoryFilters): Promise<PaginatedResponse<CategoryWithStats>> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where = this.buildWhereClause(filters);

    // Build query options
    const queryOptions: {
      include: {
        _count: {
          select: { achievements: true }
        }
      },
      orderBy: { name: 'asc' },
      skip: number,
      take: number,
      where?: any
    } = {
      include: {
        _count: {
          select: { achievements: true }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize
    };

    // Only add where clause if it has conditions
    if (Object.keys(where).length > 0) {
      queryOptions.where = where;
    }

    // Execute queries
    const [rawData, total] = await Promise.all([
      prisma.category.findMany(queryOptions) as Promise<CategoryWithCount[]>,
      prisma.category.count(Object.keys(where).length > 0 ? { where } : undefined)
    ]);

    // Transform data to include achievementCount
    const data: CategoryWithStats[] = rawData.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      createdAt: category.createdAt,
      achievementCount: category._count.achievements
    }));

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    // Validate input data
    this.validateUpdateData(data);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if new name already exists (if name is being updated and is different)
    if (data.name && data.name !== existingCategory.name) {
      const conflictingCategory = await prisma.category.findUnique({
        where: { name: data.name }
      });

      if (conflictingCategory) {
        throw new Error('Category name already exists');
      }
    }

    // Update category
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      }
    });
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<boolean> {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if category is in use by achievements
    const achievementCount = await prisma.achievement.count({
      where: { categoryId: id }
    });

    if (achievementCount > 0) {
      throw new Error('Cannot delete category that is in use by achievements');
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Validate create category data
   */
  private validateCreateData(data: CreateCategoryDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    if (data.color && !this.isValidColor(data.color)) {
      throw new Error('Invalid color format');
    }
  }

  /**
   * Validate update category data
   */
  private validateUpdateData(data: UpdateCategoryDto): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }

    if (data.color !== undefined && data.color !== null && !this.isValidColor(data.color)) {
      throw new Error('Invalid color format');
    }
  }

  /**
   * Validate color format (hex color)
   */
  private isValidColor(color: string): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: CategoryFilters): Prisma.CategoryWhereInput {
    const where: Prisma.CategoryWhereInput = {};

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }
}