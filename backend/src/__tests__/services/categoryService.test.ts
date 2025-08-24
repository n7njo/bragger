import { CategoryService } from '../../services/categoryService';
import { mockPrisma } from '../setup';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilters } from '../../types';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Development',
        color: '#3b82f6'
      };

      const mockCreatedCategory = {
        id: 'category-id-1',
        name: createDto.name,
        color: createDto.color,
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await categoryService.create(createDto);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name }
      });
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          color: createDto.color,
        }
      });
      expect(result).toEqual(mockCreatedCategory);
    });

    it('should create a category without color', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Leadership'
      };

      const mockCreatedCategory = {
        id: 'category-id-2',
        name: createDto.name,
        color: null,
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await categoryService.create(createDto);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          color: undefined,
        }
      });
      expect(result).toEqual(mockCreatedCategory);
    });

    it('should throw error when category name already exists', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Development',
        color: '#3b82f6'
      };

      const existingCategory = {
        id: 'existing-id',
        name: createDto.name,
        color: '#000000',
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(existingCategory);

      await expect(categoryService.create(createDto)).rejects.toThrow('Category name already exists');
      expect(mockPrisma.category.create).not.toHaveBeenCalled();
    });

    it('should throw error when category name is empty', async () => {
      const createDto: CreateCategoryDto = {
        name: '',
        color: '#3b82f6'
      };

      await expect(categoryService.create(createDto)).rejects.toThrow('Category name is required');
      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when category name is only whitespace', async () => {
      const createDto: CreateCategoryDto = {
        name: '   ',
        color: '#3b82f6'
      };

      await expect(categoryService.create(createDto)).rejects.toThrow('Category name is required');
      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when color format is invalid', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Development',
        color: 'invalid-color'
      };

      await expect(categoryService.create(createDto)).rejects.toThrow('Invalid color format');
      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find category by ID', async () => {
      const categoryId = 'category-id-1';
      const mockCategory = {
        id: categoryId,
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryService.findById(categoryId);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      const categoryId = 'non-existent-id';

      mockPrisma.category.findUnique.mockResolvedValue(null);

      const result = await categoryService.findById(categoryId);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all categories with pagination', async () => {
      const filters: CategoryFilters = {
        page: 1,
        pageSize: 10
      };

      const mockCategories = [
        {
          id: 'category-id-1',
          name: 'Development',
          color: '#3b82f6',
          createdAt: new Date(),
        },
        {
          id: 'category-id-2',
          name: 'Leadership',
          color: '#10b981',
          createdAt: new Date(),
        }
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(2);

      const result = await categoryService.findAll(filters);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10
      });
      expect(mockPrisma.category.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockCategories,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('should find categories with search filter', async () => {
      const filters: CategoryFilters = {
        search: 'dev',
        page: 1,
        pageSize: 10
      };

      const mockCategories = [
        {
          id: 'category-id-1',
          name: 'Development',
          color: '#3b82f6',
          createdAt: new Date(),
        }
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await categoryService.findAll(filters);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'dev', mode: 'insensitive' }
        },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10
      });
      expect(mockPrisma.category.count).toHaveBeenCalledWith({
        where: {
          name: { contains: 'dev', mode: 'insensitive' }
        }
      });
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe('findAllWithStats', () => {
    it('should find categories with achievement counts', async () => {
      const filters: CategoryFilters = {
        page: 1,
        pageSize: 10
      };

      const mockCategoriesWithStats = [
        {
          id: 'category-id-1',
          name: 'Development',
          color: '#3b82f6',
          createdAt: new Date(),
          _count: { achievements: 5 }
        },
        {
          id: 'category-id-2',
          name: 'Leadership',
          color: '#10b981',
          createdAt: new Date(),
          _count: { achievements: 3 }
        }
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategoriesWithStats);
      mockPrisma.category.count.mockResolvedValue(2);

      const result = await categoryService.findAllWithStats(filters);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { achievements: true }
          }
        },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10
      });

      expect(result.data).toEqual([
        {
          id: 'category-id-1',
          name: 'Development',
          color: '#3b82f6',
          createdAt: expect.any(Date),
          achievementCount: 5
        },
        {
          id: 'category-id-2',
          name: 'Leadership',
          color: '#10b981',
          createdAt: expect.any(Date),
          achievementCount: 3
        }
      ]);
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const categoryId = 'category-id-1';
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Development',
        color: '#ff0000'
      };

      const existingCategory = {
        id: categoryId,
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      const updatedCategory = {
        ...existingCategory,
        name: updateDto.name!,
        color: updateDto.color!,
      };

      mockPrisma.category.findUnique.mockResolvedValueOnce(existingCategory);
      mockPrisma.category.findUnique.mockResolvedValueOnce(null); // name uniqueness check
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const result = await categoryService.update(categoryId, updateDto);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: updateDto.name }
      });
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: {
          name: updateDto.name,
          color: updateDto.color,
        }
      });
      expect(result).toEqual(updatedCategory);
    });

    it('should throw error when category not found', async () => {
      const categoryId = 'non-existent-id';
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category'
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(categoryService.update(categoryId, updateDto)).rejects.toThrow('Category not found');
      expect(mockPrisma.category.update).not.toHaveBeenCalled();
    });

    it('should throw error when new name already exists', async () => {
      const categoryId = 'category-id-1';
      const updateDto: UpdateCategoryDto = {
        name: 'Existing Category'
      };

      const existingCategory = {
        id: categoryId,
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      const conflictingCategory = {
        id: 'other-id',
        name: 'Existing Category',
        color: '#000000',
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValueOnce(existingCategory);
      mockPrisma.category.findUnique.mockResolvedValueOnce(conflictingCategory);

      await expect(categoryService.update(categoryId, updateDto)).rejects.toThrow('Category name already exists');
      expect(mockPrisma.category.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same name', async () => {
      const categoryId = 'category-id-1';
      const updateDto: UpdateCategoryDto = {
        name: 'Development',
        color: '#ff0000'
      };

      const existingCategory = {
        id: categoryId,
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      const updatedCategory = {
        ...existingCategory,
        color: updateDto.color!,
      };

      mockPrisma.category.findUnique.mockResolvedValue(existingCategory);
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const result = await categoryService.update(categoryId, updateDto);

      expect(result).toEqual(updatedCategory);
    });
  });

  describe('delete', () => {
    it('should delete category successfully when no achievements exist', async () => {
      const categoryId = 'category-id-1';

      const existingCategory = {
        id: categoryId,
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(existingCategory);
      mockPrisma.achievement.count.mockResolvedValue(0);
      mockPrisma.category.delete.mockResolvedValue(existingCategory);

      const result = await categoryService.delete(categoryId);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(mockPrisma.achievement.count).toHaveBeenCalledWith({
        where: { categoryId }
      });
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(result).toBe(true);
    });

    it('should throw error when category not found', async () => {
      const categoryId = 'non-existent-id';

      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(categoryService.delete(categoryId)).rejects.toThrow('Category not found');
      expect(mockPrisma.achievement.count).not.toHaveBeenCalled();
      expect(mockPrisma.category.delete).not.toHaveBeenCalled();
    });

    it('should throw error when category has achievements', async () => {
      const categoryId = 'category-id-1';

      const existingCategory = {
        id: categoryId,
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(existingCategory);
      mockPrisma.achievement.count.mockResolvedValue(5);

      await expect(categoryService.delete(categoryId)).rejects.toThrow('Cannot delete category that is in use by achievements');
      expect(mockPrisma.category.delete).not.toHaveBeenCalled();
    });
  });
});