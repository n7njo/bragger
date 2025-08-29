import { AchievementService } from '../../services/achievementService';
import { mockPrisma } from '../setup';
import { CreateAchievementDto, UpdateAchievementDto, AchievementFilters } from '../../types';
import { Priority } from '@prisma/client';

describe('AchievementService', () => {
  let achievementService: AchievementService;

  beforeEach(() => {
    achievementService = new AchievementService();
  });

  describe('create', () => {
    it('should create an achievement successfully', async () => {
      const createDto: CreateAchievementDto = {
        title: 'Test Achievement',
        description: 'Test description',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        durationHours: 100,
        categoryId: 'category-id-1',
        impact: 'High impact achievement',
        skillsUsed: ['TypeScript', 'Node.js'],

        priority: 'high',
        tags: ['tag1', 'tag2']
      };

      const mockCategory = {
        id: 'category-id-1',
        name: 'Development',
        color: '#FF0000',
        createdAt: new Date(),
      };

      const mockTags = [
        { id: 'tag-id-1', name: 'tag1', createdAt: new Date() },
        { id: 'tag-id-2', name: 'tag2', createdAt: new Date() }
      ];

      const mockCreatedAchievement = {
        id: 'achievement-id-1',
        title: createDto.title,
        description: createDto.description,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate!),
        durationHours: createDto.durationHours,
        categoryId: createDto.categoryId,
        impact: createDto.impact,
        skillsUsed: createDto.skillsUsed,

        priority: Priority.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: mockCategory,
        tags: [
          { achievementId: 'achievement-id-1', tagId: 'tag-id-1', tag: mockTags[0] },
          { achievementId: 'achievement-id-1', tagId: 'tag-id-2', tag: mockTags[1] }
        ],
        images: []
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.tag.findMany.mockResolvedValue(mockTags);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          achievement: {
            create: jest.fn().mockResolvedValue(mockCreatedAchievement),
          }
        });
      });

      const result = await achievementService.create(createDto);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.categoryId }
      });
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { name: { in: createDto.tags } }
      });
      expect(result).toEqual(mockCreatedAchievement);
    });

    it('should throw error when category does not exist', async () => {
      const createDto: CreateAchievementDto = {
        title: 'Test Achievement',
        description: 'Test description',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'invalid-category-id',
        skillsUsed: [],
        priority: 'medium',
        tags: []
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(achievementService.create(createDto)).rejects.toThrow('Category not found');
    });

    it('should create missing tags automatically', async () => {
      const createDto: CreateAchievementDto = {
        title: 'Test Achievement',
        description: 'Test description',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'category-id-1',
        skillsUsed: [],
        priority: 'medium',
        tags: ['existing-tag', 'new-tag']
      };

      const mockCategory = {
        id: 'category-id-1',
        name: 'Development',
        color: '#FF0000',
        createdAt: new Date(),
      };

      const existingTag = { id: 'tag-id-1', name: 'existing-tag', createdAt: new Date() };
      const newTag = { id: 'tag-id-2', name: 'new-tag', createdAt: new Date() };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.tag.findMany.mockResolvedValue([existingTag]);
      mockPrisma.tag.create.mockResolvedValue(newTag);

      const mockCreatedAchievement = {
        id: 'achievement-id-1',
        title: createDto.title,
        description: createDto.description,
        startDate: new Date(createDto.startDate),
        endDate: null,
        durationHours: null,
        categoryId: createDto.categoryId,
        impact: null,
        skillsUsed: createDto.skillsUsed,

        priority: Priority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: mockCategory,
        tags: [
          { achievementId: 'achievement-id-1', tagId: 'tag-id-1', tag: existingTag },
          { achievementId: 'achievement-id-1', tagId: 'tag-id-2', tag: newTag }
        ],
        images: []
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          achievement: {
            create: jest.fn().mockResolvedValue(mockCreatedAchievement),
          },
          tag: {
            create: jest.fn().mockResolvedValue(newTag),
          }
        });
      });

      const result = await achievementService.create(createDto);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { name: { in: ['existing-tag', 'new-tag'] } }
      });
      expect(result).toEqual(mockCreatedAchievement);
    });
  });

  describe('findById', () => {
    it('should find an achievement by id successfully', async () => {
      const achievementId = 'achievement-id-1';
      const mockAchievement = {
        id: achievementId,
        title: 'Test Achievement',
        description: 'Test description',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        durationHours: 100,
        categoryId: 'category-id-1',
        impact: 'High impact',
        skillsUsed: ['TypeScript'],

        priority: Priority.HIGH,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-id-1',
          name: 'Development',
          color: '#FF0000',
          createdAt: new Date(),
        },
        tags: [],
        images: []
      };

      mockPrisma.achievement.findUnique.mockResolvedValue(mockAchievement);

      const result = await achievementService.findById(achievementId);

      expect(mockPrisma.achievement.findUnique).toHaveBeenCalledWith({
        where: { id: achievementId },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        }
      });
      expect(result).toEqual(mockAchievement);
    });

    it('should return null when achievement does not exist', async () => {
      const achievementId = 'non-existent-id';
      
      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      const result = await achievementService.findById(achievementId);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all achievements with pagination', async () => {
      const filters: AchievementFilters = {
        page: 1,
        pageSize: 10
      };

      const mockAchievements = [
        {
          id: 'achievement-id-1',
          title: 'Achievement 1',
          description: 'Description 1',
          startDate: new Date('2024-01-01'),
          endDate: null,
          durationHours: null,
          categoryId: 'category-id-1',
          impact: null,
          skillsUsed: ['TypeScript'],
  
          priority: Priority.MEDIUM,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: 'category-id-1',
            name: 'Development',
            color: '#FF0000',
            createdAt: new Date(),
          },
          tags: [],
          images: []
        }
      ];

      mockPrisma.achievement.findMany.mockResolvedValue(mockAchievements);
      mockPrisma.achievement.count.mockResolvedValue(1);

      const result = await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
      expect(mockPrisma.achievement.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockAchievements,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('should apply search filter', async () => {
      const filters: AchievementFilters = {
        search: 'test search',
        page: 1,
        pageSize: 10
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test search', mode: 'insensitive' } },
            { description: { contains: 'test search', mode: 'insensitive' } }
          ]
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });

    it('should apply category filter', async () => {
      const filters: AchievementFilters = {
        categoryId: 'category-id-1',
        page: 1,
        pageSize: 10
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: 'category-id-1'
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });

    it('should apply tags filter', async () => {
      const filters: AchievementFilters = {
        tags: ['tag1', 'tag2'],
        page: 1,
        pageSize: 10
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          tags: {
            some: {
              tag: {
                name: { in: ['tag1', 'tag2'] }
              }
            }
          }
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });

    it('should apply date range filter', async () => {
      const filters: AchievementFilters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        pageSize: 10
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          startDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });

    it('should apply priority filter', async () => {
      const filters: AchievementFilters = {
        priority: 'high',
        page: 1,
        pageSize: 10
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          priority: Priority.HIGH
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });

    it('should apply custom sorting', async () => {
      const filters: AchievementFilters = {
        sortBy: 'title',
        sortOrder: 'asc',
        page: 1,
        pageSize: 10
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { title: 'asc' },
        skip: 0,
        take: 10
      });
    });

    it('should combine multiple filters', async () => {
      const filters: AchievementFilters = {
        search: 'test',
        categoryId: 'category-id-1',
        tags: ['tag1'],
        priority: 'high',
        page: 1,
        pageSize: 5
      };

      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.achievement.count.mockResolvedValue(0);

      await achievementService.findAll(filters);

      expect(mockPrisma.achievement.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } }
          ],
          categoryId: 'category-id-1',
          tags: {
            some: {
              tag: {
                name: { in: ['tag1'] }
              }
            }
          },
          priority: Priority.HIGH
        },
        include: {
          category: true,
          tags: {
            include: { tag: true }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 5
      });
    });
  });

  describe('update', () => {
    it('should update an achievement successfully', async () => {
      const achievementId = 'achievement-id-1';
      const updateDto: UpdateAchievementDto = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'low',
        tags: ['new-tag']
      };

      const existingAchievement = {
        id: achievementId,
        categoryId: 'category-id-1'
      };

      const mockTag = { id: 'tag-id-1', name: 'new-tag', createdAt: new Date() };

      const mockUpdatedAchievement = {
        id: achievementId,
        title: updateDto.title,
        description: updateDto.description,
        startDate: new Date('2024-01-01'),
        endDate: null,
        durationHours: null,
        categoryId: 'category-id-1',
        impact: null,
        skillsUsed: [],

        priority: Priority.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-id-1',
          name: 'Development',
          color: '#FF0000',
          createdAt: new Date(),
        },
        tags: [
          { achievementId, tagId: 'tag-id-1', tag: mockTag }
        ],
        images: []
      };

      mockPrisma.achievement.findUnique.mockResolvedValue(existingAchievement);
      mockPrisma.tag.findMany.mockResolvedValue([mockTag]);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          achievement: {
            update: jest.fn().mockResolvedValue(mockUpdatedAchievement),
          },
          achievementTag: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
          }
        });
      });

      const result = await achievementService.update(achievementId, updateDto);

      expect(mockPrisma.achievement.findUnique).toHaveBeenCalledWith({
        where: { id: achievementId }
      });
      expect(result).toEqual(mockUpdatedAchievement);
    });

    it('should throw error when achievement does not exist', async () => {
      const achievementId = 'non-existent-id';
      const updateDto: UpdateAchievementDto = {
        title: 'Updated Title'
      };

      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      await expect(achievementService.update(achievementId, updateDto)).rejects.toThrow('Achievement not found');
    });

    it('should throw error when updating with invalid category', async () => {
      const achievementId = 'achievement-id-1';
      const updateDto: UpdateAchievementDto = {
        categoryId: 'invalid-category-id'
      };

      const existingAchievement = {
        id: achievementId,
        categoryId: 'category-id-1'
      };

      mockPrisma.achievement.findUnique.mockResolvedValue(existingAchievement);
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(achievementService.update(achievementId, updateDto)).rejects.toThrow('Category not found');
    });
  });

  describe('delete', () => {
    it('should delete an achievement successfully', async () => {
      const achievementId = 'achievement-id-1';

      const existingAchievement = {
        id: achievementId,
        title: 'Test Achievement'
      };

      mockPrisma.achievement.findUnique.mockResolvedValue(existingAchievement);
      mockPrisma.achievement.delete.mockResolvedValue(existingAchievement);

      const result = await achievementService.delete(achievementId);

      expect(mockPrisma.achievement.findUnique).toHaveBeenCalledWith({
        where: { id: achievementId }
      });
      expect(mockPrisma.achievement.delete).toHaveBeenCalledWith({
        where: { id: achievementId }
      });
      expect(result).toBe(true);
    });

    it('should throw error when achievement does not exist', async () => {
      const achievementId = 'non-existent-id';

      mockPrisma.achievement.findUnique.mockResolvedValue(null);

      await expect(achievementService.delete(achievementId)).rejects.toThrow('Achievement not found');
    });
  });

  describe('validateCreateData', () => {
    it('should validate create data successfully', () => {
      const validData: CreateAchievementDto = {
        title: 'Valid Title',
        description: 'Valid description',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'category-id-1',
        skillsUsed: ['TypeScript'],
        priority: 'medium',
        tags: []
      };

      expect(() => achievementService.validateCreateData(validData)).not.toThrow();
    });

    it('should throw error for missing title', () => {
      const invalidData = {
        description: 'Valid description',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'category-id-1',
        skillsUsed: ['TypeScript'],
        priority: 'medium',
        tags: []
      } as CreateAchievementDto;

      expect(() => achievementService.validateCreateData(invalidData)).toThrow('Title is required');
    });

    it('should throw error for invalid date format', () => {
      const invalidData: CreateAchievementDto = {
        title: 'Valid Title',
        description: 'Valid description',
        startDate: 'invalid-date',
        categoryId: 'category-id-1',
        skillsUsed: ['TypeScript'],
        priority: 'medium',
        tags: []
      };

      expect(() => achievementService.validateCreateData(invalidData)).toThrow('Invalid start date format');
    });

    it('should throw error for invalid priority', () => {
      const invalidData: CreateAchievementDto = {
        title: 'Valid Title',
        description: 'Valid description',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'category-id-1',
        skillsUsed: ['TypeScript'],
        priority: 'invalid' as any,
        tags: []
      };

      expect(() => achievementService.validateCreateData(invalidData)).toThrow('Invalid priority value');
    });

    it('should throw error when end date is before start date', () => {
      const invalidData: CreateAchievementDto = {
        title: 'Valid Title',
        description: 'Valid description',
        startDate: '2024-02-01T00:00:00.000Z',
        endDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'category-id-1',
        skillsUsed: ['TypeScript'],
        priority: 'medium',
        tags: []
      };

      expect(() => achievementService.validateCreateData(invalidData)).toThrow('End date must be after start date');
    });
  });

  describe('validateUpdateData', () => {
    it('should validate update data successfully', () => {
      const validData: UpdateAchievementDto = {
        title: 'Updated Title',
        priority: 'high'
      };

      expect(() => achievementService.validateUpdateData(validData)).not.toThrow();
    });

    it('should throw error for invalid priority in update', () => {
      const invalidData: UpdateAchievementDto = {
        priority: 'invalid' as any
      };

      expect(() => achievementService.validateUpdateData(invalidData)).toThrow('Invalid priority value');
    });
  });
});