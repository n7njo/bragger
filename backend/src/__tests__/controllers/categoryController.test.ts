import { Request, Response } from 'express';

// Mock the CategoryService before importing the controller
const mockFindAll = jest.fn();
const mockFindAllWithStats = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../services/categoryService', () => ({
  CategoryService: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
    findAllWithStats: mockFindAllWithStats,
    findById: mockFindById,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

// Import controller after mock
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../controllers/categoryController';

describe('CategoryController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return categories with pagination', async () => {
      const mockResult = {
        data: [
          {
            id: 'category-id-1',
            name: 'Development',
            color: '#3b82f6',
            createdAt: new Date(),
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      mockFindAll.mockResolvedValue(mockResult);

      await getCategories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: {
          total: mockResult.total,
          page: mockResult.page,
          pageSize: mockResult.pageSize,
          totalPages: mockResult.totalPages
        }
      });

      expect(mockFindAll).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('should return categories with stats when requested', async () => {
      const mockResult = {
        data: [
          {
            id: 'category-id-1',
            name: 'Development',
            color: '#3b82f6',
            createdAt: new Date(),
            achievementCount: 5
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      req.query = { includeStats: 'true' };
      mockFindAllWithStats.mockResolvedValue(mockResult);

      await getCategories(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: {
          total: mockResult.total,
          page: mockResult.page,
          pageSize: mockResult.pageSize,
          totalPages: mockResult.totalPages
        }
      });

      expect(mockFindAllWithStats).toHaveBeenCalled();
      expect(mockFindAll).not.toHaveBeenCalled();
    });

    it('should handle search and pagination parameters', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 2,
        pageSize: 5,
        totalPages: 0
      };

      req.query = { search: 'dev', page: '2', pageSize: '5' };
      mockFindAll.mockResolvedValue(mockResult);

      await getCategories(req as Request, res as Response);

      expect(mockFindAll).toHaveBeenCalledWith({
        search: 'dev',
        page: 2,
        pageSize: 5,
      });
    });

    it('should handle service errors', async () => {
      mockFindAll.mockRejectedValue(new Error('Database error'));

      await getCategories(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch categories',
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', async () => {
      const mockCategory = {
        id: 'category-id-1',
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      req.params = { id: 'category-id-1' };
      mockFindById.mockResolvedValue(mockCategory);

      await getCategoryById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCategory,
      });

      expect(mockFindById).toHaveBeenCalledWith('category-id-1');
    });

    it('should return 404 when category not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockFindById.mockResolvedValue(null);

      await getCategoryById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category not found',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'category-id-1' };
      mockFindById.mockRejectedValue(new Error('Database error'));

      await getCategoryById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch category',
      });
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const mockCreatedCategory = {
        id: 'category-id-1',
        name: 'Development',
        color: '#3b82f6',
        createdAt: new Date(),
      };

      req.body = { name: 'Development', color: '#3b82f6' };
      mockCreate.mockResolvedValue(mockCreatedCategory);

      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedCategory,
        message: 'Category created successfully',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Development',
        color: '#3b82f6'
      });
    });

    it('should handle validation errors', async () => {
      req.body = { name: '', color: '#3b82f6' };
      mockCreate.mockRejectedValue(new Error('Category name is required'));

      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category name is required',
      });
    });

    it('should handle duplicate name errors', async () => {
      req.body = { name: 'Existing Category', color: '#3b82f6' };
      mockCreate.mockRejectedValue(new Error('Category name already exists'));

      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category name already exists',
      });
    });

    it('should handle color format errors', async () => {
      req.body = { name: 'Test Category', color: 'invalid-color' };
      mockCreate.mockRejectedValue(new Error('Invalid color format'));

      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid color format',
      });
    });

    it('should handle service errors', async () => {
      req.body = { name: 'Test Category', color: '#3b82f6' };
      mockCreate.mockRejectedValue(new Error('Database error'));

      await createCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create category',
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const mockUpdatedCategory = {
        id: 'category-id-1',
        name: 'Updated Development',
        color: '#ff0000',
        createdAt: new Date(),
      };

      req.params = { id: 'category-id-1' };
      req.body = { name: 'Updated Development', color: '#ff0000' };
      mockUpdate.mockResolvedValue(mockUpdatedCategory);

      await updateCategory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCategory,
        message: 'Category updated successfully',
      });

      expect(mockUpdate).toHaveBeenCalledWith('category-id-1', {
        name: 'Updated Development',
        color: '#ff0000'
      });
    });

    it('should handle category not found', async () => {
      req.params = { id: 'non-existent-id' };
      req.body = { name: 'Updated Category' };
      mockUpdate.mockRejectedValue(new Error('Category not found'));

      await updateCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category not found',
      });
    });

    it('should handle validation errors', async () => {
      req.params = { id: 'category-id-1' };
      req.body = { name: '' };
      mockUpdate.mockRejectedValue(new Error('Category name cannot be empty'));

      await updateCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category name cannot be empty',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'category-id-1' };
      req.body = { name: 'Updated Category' };
      mockUpdate.mockRejectedValue(new Error('Database error'));

      await updateCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update category',
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      req.params = { id: 'category-id-1' };
      mockDelete.mockResolvedValue(true);

      await deleteCategory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category deleted successfully',
      });

      expect(mockDelete).toHaveBeenCalledWith('category-id-1');
    });

    it('should handle category not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockDelete.mockRejectedValue(new Error('Category not found'));

      await deleteCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category not found',
      });
    });

    it('should handle category in use error', async () => {
      req.params = { id: 'category-id-1' };
      mockDelete.mockRejectedValue(
        new Error('Cannot delete category that is in use by achievements')
      );

      await deleteCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot delete category that is in use by achievements',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'category-id-1' };
      mockDelete.mockRejectedValue(new Error('Database error'));

      await deleteCategory(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete category',
      });
    });
  });
});