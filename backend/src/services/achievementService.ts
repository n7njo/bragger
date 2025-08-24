import { Priority, Prisma } from '@prisma/client';
import { prisma } from './database';
import { 
  CreateAchievementDto, 
  UpdateAchievementDto, 
  AchievementFilters,
  PaginatedResponse
} from '../types';

type AchievementWithRelations = Prisma.AchievementGetPayload<{
  include: {
    category: true;
    tags: {
      include: {
        tag: true;
      };
    };
    images: true;
  };
}>;

export class AchievementService {
  /**
   * Create a new achievement
   */
  async create(data: CreateAchievementDto): Promise<AchievementWithRelations> {
    // Validate input data
    this.validateCreateData(data);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Find existing tags and create missing ones
    const existingTags = await prisma.tag.findMany({
      where: { name: { in: data.tags } }
    });

    const existingTagNames = existingTags.map(tag => tag.name);
    const missingTagNames = data.tags.filter(tagName => !existingTagNames.includes(tagName));

    return prisma.$transaction(async (tx) => {
      // Create missing tags
      const newTags = [];
      for (const tagName of missingTagNames) {
        const newTag = await tx.tag.create({
          data: { name: tagName }
        });
        newTags.push(newTag);
      }

      const allTags = [...existingTags, ...newTags];

      // Create achievement
      const achievement = await tx.achievement.create({
        data: {
          title: data.title,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          durationHours: data.durationHours || null,
          categoryId: data.categoryId,
          impact: data.impact || null,
          skillsUsed: data.skillsUsed,
          teamSize: data.teamSize || null,
          priority: this.mapPriority(data.priority),
          tags: {
            create: allTags.map(tag => ({
              tagId: tag.id
            }))
          }
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          images: true
        }
      });

      return achievement;
    });
  }

  /**
   * Find achievement by ID
   */
  async findById(id: string): Promise<AchievementWithRelations | null> {
    return prisma.achievement.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        images: true
      }
    });
  }

  /**
   * Find all achievements with filtering and pagination
   */
  async findAll(filters: AchievementFilters): Promise<PaginatedResponse<AchievementWithRelations>> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where = this.buildWhereClause(filters);

    // Build order by clause
    const orderBy = this.buildOrderByClause(filters);

    // Build query options
    const queryOptions: any = {
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        images: true
      },
      orderBy,
      skip,
      take: pageSize
    };

    // Only add where clause if it has conditions
    if (Object.keys(where).length > 0) {
      queryOptions.where = where;
    }

    // Execute queries
    const [data, total] = await Promise.all([
      prisma.achievement.findMany(queryOptions),
      prisma.achievement.count(Object.keys(where).length > 0 ? { where } : undefined)
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data as AchievementWithRelations[],
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Update an achievement
   */
  async update(id: string, data: UpdateAchievementDto): Promise<AchievementWithRelations> {
    // Validate input data
    this.validateUpdateData(data);

    // Check if achievement exists
    const existingAchievement = await prisma.achievement.findUnique({
      where: { id }
    });

    if (!existingAchievement) {
      throw new Error('Achievement not found');
    }

    // Check if category exists (if being updated)
    if (data.categoryId && data.categoryId !== existingAchievement.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    // Handle tags if provided
    if (data.tags) {
      const existingTags = await prisma.tag.findMany({
        where: { name: { in: data.tags } }
      });

      const existingTagNames = existingTags.map(tag => tag.name);
      const missingTagNames = data.tags.filter(tagName => !existingTagNames.includes(tagName));

      return prisma.$transaction(async (tx) => {
        // Create missing tags
        const newTags = [];
        for (const tagName of missingTagNames) {
          const newTag = await tx.tag.create({
            data: { name: tagName }
          });
          newTags.push(newTag);
        }

        const allTags = [...existingTags, ...newTags];

        // Delete existing tag associations
        await tx.achievementTag.deleteMany({
          where: { achievementId: id }
        });

        // Create new tag associations
        await tx.achievementTag.createMany({
          data: allTags.map(tag => ({
            achievementId: id,
            tagId: tag.id
          }))
        });

        // Update achievement
        const updatedAchievement = await tx.achievement.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            durationHours: data.durationHours,
            categoryId: data.categoryId,
            impact: data.impact,
            skillsUsed: data.skillsUsed,
            teamSize: data.teamSize,
            priority: data.priority ? this.mapPriority(data.priority) : undefined
          },
          include: {
            category: true,
            tags: {
              include: {
                tag: true
              }
            },
            images: true
          }
        });

        return updatedAchievement;
      });
    }

    // Update without tags
    return prisma.achievement.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        durationHours: data.durationHours,
        categoryId: data.categoryId,
        impact: data.impact,
        skillsUsed: data.skillsUsed,
        teamSize: data.teamSize,
        priority: data.priority ? this.mapPriority(data.priority) : undefined
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        images: true
      }
    });
  }

  /**
   * Delete an achievement
   */
  async delete(id: string): Promise<boolean> {
    const existingAchievement = await prisma.achievement.findUnique({
      where: { id }
    });

    if (!existingAchievement) {
      throw new Error('Achievement not found');
    }

    await prisma.achievement.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Validate create achievement data
   */
  validateCreateData(data: CreateAchievementDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }

    if (!data.startDate) {
      throw new Error('Start date is required');
    }

    // Validate start date format
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start date format');
    }

    // Validate end date if provided
    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format');
      }

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    if (!data.categoryId || data.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }

    if (!['low', 'medium', 'high'].includes(data.priority)) {
      throw new Error('Invalid priority value');
    }

    if (data.durationHours !== undefined && data.durationHours < 0) {
      throw new Error('Duration hours must be non-negative');
    }

    if (data.teamSize !== undefined && data.teamSize < 1) {
      throw new Error('Team size must be at least 1');
    }
  }

  /**
   * Validate update achievement data
   */
  validateUpdateData(data: UpdateAchievementDto): void {
    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    if (data.description !== undefined && data.description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }

    if (data.startDate !== undefined) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date format');
      }
    }

    if (data.endDate !== undefined) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format');
      }
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    if (data.categoryId !== undefined && data.categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }

    if (data.priority !== undefined && !['low', 'medium', 'high'].includes(data.priority)) {
      throw new Error('Invalid priority value');
    }

    if (data.durationHours !== undefined && data.durationHours < 0) {
      throw new Error('Duration hours must be non-negative');
    }

    if (data.teamSize !== undefined && data.teamSize < 1) {
      throw new Error('Team size must be at least 1');
    }
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: AchievementFilters): Prisma.AchievementWhereInput {
    const where: Prisma.AchievementWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: filters.tags }
          }
        }
      };
    }

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate);
      }
    }

    if (filters.priority) {
      where.priority = this.mapPriority(filters.priority);
    }

    return where;
  }

  /**
   * Build order by clause for sorting
   */
  private buildOrderByClause(filters: AchievementFilters): Prisma.AchievementOrderByWithRelationInput {
    if (filters.sortBy && filters.sortOrder) {
      return { [filters.sortBy]: filters.sortOrder };
    }
    return { createdAt: 'desc' };
  }

  /**
   * Map string priority to Prisma Priority enum
   */
  private mapPriority(priority: 'low' | 'medium' | 'high'): Priority {
    const priorityMap: Record<string, Priority> = {
      'low': Priority.LOW,
      'medium': Priority.MEDIUM,
      'high': Priority.HIGH,
    };
    return priorityMap[priority];
  }
}