import { Status, Prisma } from '@prisma/client';
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
    milestones: {
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ];
    };
  };
}>;

export class AchievementService {
  /**
   * Create a new achievement
   */
  async create(userId: string, data: CreateAchievementDto): Promise<AchievementWithRelations> {
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
    const tags = data.tags || [];
    const existingTags = await prisma.tag.findMany({
      where: { name: { in: tags } }
    });

    const existingTagNames = existingTags.map(tag => tag.name);
    const missingTagNames = tags.filter(tagName => !existingTagNames.includes(tagName));

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
          userId: userId,
          title: data.title,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          durationHours: data.durationHours || null,
          categoryId: data.categoryId,
          impact: data.impact || null,
          skillsUsed: data.skillsUsed,
          status: this.mapStatus(data.status),
          githubUrl: data.githubUrl || null,
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
          images: true,
          milestones: {
            orderBy: [
              { order: 'asc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });

    // Transform milestones to include isCompleted field and flatten tags
    const transformedAchievement = {
      ...achievement,
      tags: achievement.tags?.map((tagRelation: any) => tagRelation.tag) || [],
      milestones: achievement.milestones?.map((milestone: any) => ({
        ...milestone,
        isCompleted: !!milestone.completedAt
      })) || []
    };

    return transformedAchievement;
    });
  }

  /**
   * Find achievement by ID (with user authorization)
   */
  async findById(id: string, userId?: string): Promise<AchievementWithRelations | null> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const achievement = await prisma.achievement.findFirst({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        images: true,
        milestones: {
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    if (!achievement) return null;

    // Transform milestones to include isCompleted field and flatten tags
    const transformedAchievement = {
      ...achievement,
      tags: achievement.tags?.map((tagRelation: any) => tagRelation.tag) || [],
      milestones: achievement.milestones?.map((milestone: any) => ({
        ...milestone,
        isCompleted: !!milestone.completedAt
      })) || []
    };

    return transformedAchievement;
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
        images: true,
        milestones: {
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' }
          ]
        }
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

    // Transform milestones to include isCompleted field and flatten tags
    const transformedData = data.map((achievement: any) => ({
      ...achievement,
      tags: achievement.tags?.map((tagRelation: any) => tagRelation.tag) || [],
      milestones: achievement.milestones?.map((milestone: any) => ({
        ...milestone,
        isCompleted: !!milestone.completedAt
      })) || []
    }));

    return {
      data: transformedData as AchievementWithRelations[],
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Update an achievement
   */
  async update(id: string, userId: string, data: UpdateAchievementDto): Promise<AchievementWithRelations> {
    // Validate input data
    this.validateUpdateData(data);

    // Check if achievement exists and belongs to user
    const existingAchievement = await prisma.achievement.findFirst({
      where: { 
        id,
        userId 
      }
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

            status: data.status ? this.mapStatus(data.status) : undefined,
            githubUrl: data.githubUrl
          },
          include: {
            category: true,
            tags: {
              include: {
                tag: true
              }
            },
            images: true,
            milestones: {
              orderBy: { order: 'asc' }
            }
          }
        });

        // Transform milestones to include isCompleted field
        const transformedAchievement = {
          ...updatedAchievement,
          milestones: updatedAchievement.milestones?.map((milestone: any) => ({
            ...milestone,
            isCompleted: !!milestone.completedAt
          })) || []
        };

        return transformedAchievement;
      });
    }

    // Update without tags
    const updatedAchievement = await prisma.achievement.update({
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
        status: data.status ? this.mapStatus(data.status) : undefined,
        githubUrl: data.githubUrl
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        images: true,
        milestones: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Transform milestones to include isCompleted field and flatten tags
    const transformedAchievement = {
      ...updatedAchievement,
      tags: updatedAchievement.tags?.map((tagRelation: any) => tagRelation.tag) || [],
      milestones: updatedAchievement.milestones?.map((milestone: any) => ({
        ...milestone,
        isCompleted: !!milestone.completedAt
      })) || []
    };

    return transformedAchievement;
  }

  /**
   * Delete an achievement
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existingAchievement = await prisma.achievement.findFirst({
      where: { 
        id,
        userId 
      }
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

    if (!['idea', 'concept', 'usable', 'complete'].includes(data.status)) {
      throw new Error('Invalid status value');
    }

    if (data.durationHours !== undefined && data.durationHours < 0) {
      throw new Error('Duration hours must be non-negative');
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

    if (data.status !== undefined && !['idea', 'concept', 'usable', 'complete'].includes(data.status)) {
      throw new Error('Invalid status value');
    }

    if (data.durationHours !== undefined && data.durationHours < 0) {
      throw new Error('Duration hours must be non-negative');
    }


  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: AchievementFilters): Prisma.AchievementWhereInput {
    const where: Prisma.AchievementWhereInput = {};

    // Always filter by user if provided
    if (filters.userId) {
      where.userId = filters.userId;
    }

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

    if (filters.status) {
      where.status = this.mapStatus(filters.status);
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
   * Map string status to Prisma Status enum
   */
  private mapStatus(status: 'idea' | 'concept' | 'usable' | 'complete'): Status {
    const statusMap: Record<string, Status> = {
      'idea': Status.IDEA,
      'concept': Status.CONCEPT,
      'usable': Status.USABLE,
      'complete': Status.COMPLETE,
    };
    return statusMap[status];
  }
}