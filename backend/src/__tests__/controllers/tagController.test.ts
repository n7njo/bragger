import { Request, Response } from 'express';

// Mock the TagService before importing the controller
const mockFindAll = jest.fn();
const mockFindAllWithStats = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../services/tagService', () => ({
  TagService: jest.fn().mockImplementation(() => ({
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
  getTags, 
  getTagById, 
  createTag, 
  updateTag, 
  deleteTag 
} from '../../controllers/tagController';

describe('TagController', () => {
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

  describe('getTags', () => {
    it('should return tags with pagination', async () => {
      const mockResult = {
        data: [
          {
            id: 'tag-id-1',
            name: 'react',
            createdAt: new Date(),
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      mockFindAll.mockResolvedValue(mockResult);

      await getTags(req as Request, res as Response);

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

    it('should return tags with stats when requested', async () => {
      const mockResult = {
        data: [
          {
            id: 'tag-id-1',
            name: 'react',
            createdAt: new Date(),
            usageCount: 5
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      req.query = { includeStats: 'true' };
      mockFindAllWithStats.mockResolvedValue(mockResult);

      await getTags(req as Request, res as Response);

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

      req.query = { search: 'react', page: '2', pageSize: '5' };
      mockFindAll.mockResolvedValue(mockResult);

      await getTags(req as Request, res as Response);

      expect(mockFindAll).toHaveBeenCalledWith({
        search: 'react',
        page: 2,
        pageSize: 5,
      });
    });

    it('should handle service errors', async () => {
      mockFindAll.mockRejectedValue(new Error('Database error'));

      await getTags(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch tags',
      });
    });
  });

  describe('getTagById', () => {
    it('should return tag by ID', async () => {
      const mockTag = {
        id: 'tag-id-1',
        name: 'react',
        createdAt: new Date(),
      };

      req.params = { id: 'tag-id-1' };
      mockFindById.mockResolvedValue(mockTag);

      await getTagById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTag,
      });

      expect(mockFindById).toHaveBeenCalledWith('tag-id-1');
    });

    it('should return 404 when tag not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockFindById.mockResolvedValue(null);

      await getTagById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tag not found',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'tag-id-1' };
      mockFindById.mockRejectedValue(new Error('Database error'));

      await getTagById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch tag',
      });
    });
  });

  describe('createTag', () => {
    it('should create tag successfully', async () => {
      const mockCreatedTag = {
        id: 'tag-id-1',
        name: 'react',
        createdAt: new Date(),
      };

      req.body = { name: 'React' };
      mockCreate.mockResolvedValue(mockCreatedTag);

      await createTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedTag,
        message: 'Tag created successfully',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        name: 'React'
      });
    });

    it('should handle validation errors', async () => {
      req.body = { name: '' };
      mockCreate.mockRejectedValue(new Error('Tag name is required'));

      await createTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tag name is required',
      });
    });

    it('should handle duplicate name errors', async () => {
      req.body = { name: 'existing-tag' };
      mockCreate.mockRejectedValue(new Error('Tag name already exists'));

      await createTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tag name already exists',
      });
    });

    it('should handle service errors', async () => {
      req.body = { name: 'Test Tag' };
      mockCreate.mockRejectedValue(new Error('Database error'));

      await createTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create tag',
      });
    });
  });

  describe('updateTag', () => {
    it('should update tag successfully', async () => {
      const mockUpdatedTag = {
        id: 'tag-id-1',
        name: 'reactjs',
        createdAt: new Date(),
      };

      req.params = { id: 'tag-id-1' };
      req.body = { name: 'ReactJS' };
      mockUpdate.mockResolvedValue(mockUpdatedTag);

      await updateTag(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTag,
        message: 'Tag updated successfully',
      });

      expect(mockUpdate).toHaveBeenCalledWith('tag-id-1', {
        name: 'ReactJS'
      });
    });

    it('should handle tag not found', async () => {
      req.params = { id: 'non-existent-id' };
      req.body = { name: 'Updated Tag' };
      mockUpdate.mockRejectedValue(new Error('Tag not found'));

      await updateTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tag not found',
      });
    });

    it('should handle validation errors', async () => {
      req.params = { id: 'tag-id-1' };
      req.body = { name: '' };
      mockUpdate.mockRejectedValue(new Error('Tag name cannot be empty'));

      await updateTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tag name cannot be empty',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'tag-id-1' };
      req.body = { name: 'Updated Tag' };
      mockUpdate.mockRejectedValue(new Error('Database error'));

      await updateTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update tag',
      });
    });
  });

  describe('deleteTag', () => {
    it('should delete tag successfully', async () => {
      req.params = { id: 'tag-id-1' };
      mockDelete.mockResolvedValue(true);

      await deleteTag(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tag deleted successfully',
      });

      expect(mockDelete).toHaveBeenCalledWith('tag-id-1');
    });

    it('should handle tag not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockDelete.mockRejectedValue(new Error('Tag not found'));

      await deleteTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tag not found',
      });
    });

    it('should handle tag in use error', async () => {
      req.params = { id: 'tag-id-1' };
      mockDelete.mockRejectedValue(
        new Error('Cannot delete tag that is in use by achievements')
      );

      await deleteTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot delete tag that is in use by achievements',
      });
    });

    it('should handle service errors', async () => {
      req.params = { id: 'tag-id-1' };
      mockDelete.mockRejectedValue(new Error('Database error'));

      await deleteTag(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete tag',
      });
    });
  });
});