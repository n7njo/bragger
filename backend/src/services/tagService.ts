import { Prisma } from '@prisma/client';
import { prisma } from './database';
import { 
  CreateTagDto, 
  UpdateTagDto, 
  TagFilters,
  TagWithStats,
  PaginatedResponse,
  Tag
} from '../types';

type TagWithCount = Prisma.TagGetPayload<{
  include: {
    _count: {
      select: { achievements: true };
    };
  };
}>;

export class TagService {
  /**
   * Create a new tag
   */
  async create(data: CreateTagDto): Promise<Tag> {
    // Validate input data
    this.validateCreateData(data);

    // Normalize tag name to lowercase
    const normalizedName = data.name.toLowerCase();

    // Check if tag name already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: normalizedName }
    });

    if (existingTag) {
      throw new Error('Tag name already exists');
    }

    // Create tag
    return prisma.tag.create({
      data: {
        name: normalizedName,
      }
    });
  }

  /**
   * Find tag by ID
   */
  async findById(id: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id }
    });
  }

  /**
   * Find all tags with filtering and pagination
   */
  async findAll(filters: TagFilters): Promise<PaginatedResponse<Tag>> {
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
      prisma.tag.findMany(queryOptions),
      prisma.tag.count(Object.keys(where).length > 0 ? { where } : undefined)
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
   * Find all tags with usage counts
   */
  async findAllWithStats(filters: TagFilters): Promise<PaginatedResponse<TagWithStats>> {
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
      prisma.tag.findMany(queryOptions) as Promise<TagWithCount[]>,
      prisma.tag.count(Object.keys(where).length > 0 ? { where } : undefined)
    ]);

    // Transform data to include usageCount
    const data: TagWithStats[] = rawData.map((tag) => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      usageCount: tag._count.achievements
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
   * Update a tag
   */
  async update(id: string, data: UpdateTagDto): Promise<Tag> {
    // Validate input data
    this.validateUpdateData(data);

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      throw new Error('Tag not found');
    }

    // Normalize new name if provided
    const normalizedName = data.name ? data.name.toLowerCase() : undefined;

    // Check if new name already exists (if name is being updated and is different)
    if (normalizedName && normalizedName !== existingTag.name) {
      const conflictingTag = await prisma.tag.findUnique({
        where: { name: normalizedName }
      });

      if (conflictingTag) {
        throw new Error('Tag name already exists');
      }
    }

    // Update tag
    return prisma.tag.update({
      where: { id },
      data: {
        name: normalizedName,
      }
    });
  }

  /**
   * Delete a tag
   */
  async delete(id: string): Promise<boolean> {
    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      throw new Error('Tag not found');
    }

    // Check if tag is in use by achievements
    const achievementCount = await prisma.achievementTag.count({
      where: { tagId: id }
    });

    if (achievementCount > 0) {
      throw new Error('Cannot delete tag that is in use by achievements');
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Find tags by array of names
   */
  async findByNames(names: string[]): Promise<Tag[]> {
    if (names.length === 0) {
      return [];
    }

    // Normalize names to lowercase
    const normalizedNames = names.map(name => name.toLowerCase());

    return prisma.tag.findMany({
      where: { name: { in: normalizedNames } }
    });
  }

  /**
   * Find existing tags by names and create missing ones
   */
  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    if (names.length === 0) {
      return [];
    }

    // Normalize names to lowercase
    const normalizedNames = names.map(name => name.toLowerCase());

    // Find existing tags
    const existingTags = await prisma.tag.findMany({
      where: { name: { in: normalizedNames } }
    });

    const existingTagNames = existingTags.map(tag => tag.name);
    const missingTagNames = normalizedNames.filter(tagName => !existingTagNames.includes(tagName));

    // If no missing tags, return existing ones
    if (missingTagNames.length === 0) {
      return existingTags;
    }

    // Create missing tags in transaction
    return prisma.$transaction(async (tx) => {
      const newTags = [];
      for (const tagName of missingTagNames) {
        const newTag = await tx.tag.create({
          data: { name: tagName }
        });
        newTags.push(newTag);
      }

      return [...existingTags, ...newTags];
    });
  }

  /**
   * Validate create tag data
   */
  private validateCreateData(data: CreateTagDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tag name is required');
    }
  }

  /**
   * Validate update tag data
   */
  private validateUpdateData(data: UpdateTagDto): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Tag name cannot be empty');
    }
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: TagFilters): Prisma.TagWhereInput {
    const where: Prisma.TagWhereInput = {};

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }
}