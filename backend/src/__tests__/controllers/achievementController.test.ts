import { Request, Response } from 'express';

// Mock the AchievementService before importing the controller
const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../services/achievementService', () => ({
  AchievementService: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
    findById: mockFindById,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

// Import controller after mock
import { 
  getAchievements, 
  getAchievement, 
  createAchievement, 
  updateAchievement, 
  deleteAchievement 
} from '../../controllers/achievementController';

describe('AchievementController', () => {
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

  describe('getAchievements', () => {
    it('should return paginated achievements successfully', async () => {
      const mockResult = {
        data: [
          {
            id: 'achievement-1',
            title: 'Test Achievement',
            description: 'Test description',
            startDate: new Date('2024-01-01'),
            endDate: null,
            durationHours: null,
            categoryId: 'category-1',
            impact: null,
            skillsUsed: ['TypeScript'],
            teamSize: null,
            priority: 'MEDIUM',
            createdAt: new Date(),
            updatedAt: new Date(),
            category: {
              id: 'category-1',
              name: 'Development',
              color: '#FF0000',
              createdAt: new Date(),
            },
            tags: [],
            images: []
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      req.query = {
        page: '1',
        pageSize: '10',
        search: 'test',
        categoryId: 'category-1'
      };

      mockFindAll.mockResolvedValue(mockResult);

      await getAchievements(req as Request, res as Response);

      expect(mockFindAll).toHaveBeenCalledWith({
        search: 'test',
        categoryId: 'category-1',
        tags: undefined,
        startDate: undefined,
        endDate: undefined,
        priority: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        page: 1,
        pageSize: 10,
      });
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle tags parameter as array', async () => {
      req.query = {
        tags: ['tag1', 'tag2']
      };

      mockFindAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      });

      await getAchievements(req as Request, res as Response);

      expect(mockFindAll).toHaveBeenCalledWith({
        search: undefined,
        categoryId: undefined,
        tags: ['tag1', 'tag2'],
        startDate: undefined,
        endDate: undefined,
        priority: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('should handle tags parameter as single string', async () => {
      req.query = {
        tags: 'single-tag'
      };

      mockFindAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      });

      await getAchievements(req as Request, res as Response);

      expect(mockFindAll).toHaveBeenCalledWith({
        search: undefined,
        categoryId: undefined,
        tags: ['single-tag'],
        startDate: undefined,
        endDate: undefined,
        priority: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('should handle service errors', async () => {
      mockFindAll.mockRejectedValue(new Error('Database error'));

      await getAchievements(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch achievements',
      });
    });
  });

  describe('getAchievement', () => {
    it('should return achievement successfully', async () => {
      const mockAchievement = {
        id: 'achievement-1',
        title: 'Test Achievement',
        description: 'Test description',
        startDate: new Date('2024-01-01'),
        endDate: null,
        durationHours: null,
        categoryId: 'category-1',
        impact: null,
        skillsUsed: ['TypeScript'],
        teamSize: null,
        priority: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-1',
          name: 'Development',
          color: '#FF0000',
          createdAt: new Date(),
        },
        tags: [],
        images: []
      };

      req.params = { id: 'achievement-1' };
      mockFindById.mockResolvedValue(mockAchievement);

      await getAchievement(req as Request, res as Response);

      expect(mockFindById).toHaveBeenCalledWith('achievement-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAchievement,
      });
    });

    it('should return 404 when achievement not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockFindById.mockResolvedValue(null);

      await getAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Achievement not found',
      });
    });

    it('should return 400 when ID is missing', async () => {
      req.params = {};

      await getAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Achievement ID is required',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'achievement-1' };
      mockFindById.mockRejectedValue(new Error('Database error'));

      await getAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch achievement',
      });
    });
  });

  describe('createAchievement', () => {
    it('should create achievement successfully', async () => {
      const createDto = {
        title: 'New Achievement',
        description: 'New description',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'category-1',
        skillsUsed: ['TypeScript'],
        priority: 'medium' as const,
        tags: ['tag1']
      };

      const mockCreatedAchievement = {
        id: 'achievement-1',
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: null,
        durationHours: null,
        impact: null,
        teamSize: null,
        priority: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-1',
          name: 'Development',
          color: '#FF0000',
          createdAt: new Date(),
        },
        tags: [],
        images: []
      };

      req.body = createDto;
      mockCreate.mockResolvedValue(mockCreatedAchievement);

      await createAchievement(req as Request, res as Response);

      expect(mockCreate).toHaveBeenCalledWith(createDto);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedAchievement,
        message: 'Achievement created successfully',
      });
    });

    it('should handle validation errors', async () => {
      req.body = { title: '', description: 'Test' };
      mockCreate.mockRejectedValue(new Error('Title is required'));

      await createAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Title is required',
      });
    });

    it('should handle not found errors', async () => {
      req.body = { 
        title: 'Test',
        description: 'Test',
        startDate: '2024-01-01T00:00:00.000Z',
        categoryId: 'invalid-category-id',
        skillsUsed: [],
        priority: 'medium',
        tags: []
      };
      mockCreate.mockRejectedValue(new Error('Category not found'));

      await createAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category not found',
      });
    });

    it('should handle service errors', async () => {
      req.body = { title: 'Test', description: 'Test' };
      mockCreate.mockRejectedValue(new Error('Database error'));

      await createAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create achievement',
      });
    });
  });

  describe('updateAchievement', () => {
    it('should update achievement successfully', async () => {
      const updateDto = {
        title: 'Updated Title',
        priority: 'high' as const
      };

      const mockUpdatedAchievement = {
        id: 'achievement-1',
        title: 'Updated Title',
        description: 'Test description',
        startDate: new Date('2024-01-01'),
        endDate: null,
        durationHours: null,
        categoryId: 'category-1',
        impact: null,
        skillsUsed: ['TypeScript'],
        teamSize: null,
        priority: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-1',
          name: 'Development',
          color: '#FF0000',
          createdAt: new Date(),
        },
        tags: [],
        images: []
      };

      req.params = { id: 'achievement-1' };
      req.body = updateDto;
      mockUpdate.mockResolvedValue(mockUpdatedAchievement);

      await updateAchievement(req as Request, res as Response);

      expect(mockUpdate).toHaveBeenCalledWith('achievement-1', updateDto);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedAchievement,
        message: 'Achievement updated successfully',
      });
    });

    it('should return 400 when ID is missing', async () => {
      req.params = {};
      req.body = { title: 'Updated Title' };

      await updateAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Achievement ID is required',
      });
    });

    it('should return 404 when achievement not found', async () => {
      req.params = { id: 'non-existent-id' };
      req.body = { title: 'Updated Title' };
      mockUpdate.mockRejectedValue(new Error('Achievement not found'));

      await updateAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Achievement not found',
      });
    });

    it('should handle validation errors', async () => {
      req.params = { id: 'achievement-1' };
      req.body = { priority: 'invalid' };
      mockUpdate.mockRejectedValue(new Error('Invalid priority value'));

      await updateAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid priority value',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'achievement-1' };
      req.body = { title: 'Updated Title' };
      mockUpdate.mockRejectedValue(new Error('Database error'));

      await updateAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update achievement',
      });
    });
  });

  describe('deleteAchievement', () => {
    it('should delete achievement successfully', async () => {
      req.params = { id: 'achievement-1' };
      mockDelete.mockResolvedValue(true);

      await deleteAchievement(req as Request, res as Response);

      expect(mockDelete).toHaveBeenCalledWith('achievement-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Achievement deleted successfully',
      });
    });

    it('should return 400 when ID is missing', async () => {
      req.params = {};

      await deleteAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Achievement ID is required',
      });
    });

    it('should return 404 when achievement not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockDelete.mockRejectedValue(new Error('Achievement not found'));

      await deleteAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Achievement not found',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'achievement-1' };
      mockDelete.mockRejectedValue(new Error('Database error'));

      await deleteAchievement(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete achievement',
      });
    });
  });
});