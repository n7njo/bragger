import { TagService } from '../../services/tagService';
import { mockPrisma } from '../setup';
import { CreateTagDto, UpdateTagDto, TagFilters } from '../../types';

describe('TagService', () => {
  let tagService: TagService;

  beforeEach(() => {
    tagService = new TagService();
  });

  describe('create', () => {
    it('should create a tag successfully', async () => {
      const createDto: CreateTagDto = {
        name: 'React'
      };

      const mockCreatedTag = {
        id: 'tag-id-1',
        name: createDto.name,
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue(mockCreatedTag);

      const result = await tagService.create(createDto);

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name.toLowerCase() }
      });
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name.toLowerCase(),
        }
      });
      expect(result).toEqual(mockCreatedTag);
    });

    it('should throw error when tag name already exists', async () => {
      const createDto: CreateTagDto = {
        name: 'React'
      };

      const existingTag = {
        id: 'existing-id',
        name: createDto.name,
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(existingTag);

      await expect(tagService.create(createDto)).rejects.toThrow('Tag name already exists');
      expect(mockPrisma.tag.create).not.toHaveBeenCalled();
    });

    it('should throw error when tag name is empty', async () => {
      const createDto: CreateTagDto = {
        name: ''
      };

      await expect(tagService.create(createDto)).rejects.toThrow('Tag name is required');
      expect(mockPrisma.tag.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error when tag name is only whitespace', async () => {
      const createDto: CreateTagDto = {
        name: '   '
      };

      await expect(tagService.create(createDto)).rejects.toThrow('Tag name is required');
      expect(mockPrisma.tag.findUnique).not.toHaveBeenCalled();
    });

    it('should normalize tag name to lowercase', async () => {
      const createDto: CreateTagDto = {
        name: 'ReactJS'
      };

      const mockCreatedTag = {
        id: 'tag-id-1',
        name: 'reactjs',
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue(mockCreatedTag);

      const result = await tagService.create(createDto);

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: 'reactjs' }
      });
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: 'reactjs',
        }
      });
      expect(result).toEqual(mockCreatedTag);
    });
  });

  describe('findById', () => {
    it('should find tag by ID', async () => {
      const tagId = 'tag-id-1';
      const mockTag = {
        id: tagId,
        name: 'react',
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(mockTag);

      const result = await tagService.findById(tagId);

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId }
      });
      expect(result).toEqual(mockTag);
    });

    it('should return null when tag not found', async () => {
      const tagId = 'non-existent-id';

      mockPrisma.tag.findUnique.mockResolvedValue(null);

      const result = await tagService.findById(tagId);

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId }
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all tags with pagination', async () => {
      const filters: TagFilters = {
        page: 1,
        pageSize: 10
      };

      const mockTags = [
        {
          id: 'tag-id-1',
          name: 'react',
          createdAt: new Date(),
        },
        {
          id: 'tag-id-2',
          name: 'typescript',
          createdAt: new Date(),
        }
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTags);
      mockPrisma.tag.count.mockResolvedValue(2);

      const result = await tagService.findAll(filters);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10
      });
      expect(mockPrisma.tag.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockTags,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('should find tags with search filter', async () => {
      const filters: TagFilters = {
        search: 'react',
        page: 1,
        pageSize: 10
      };

      const mockTags = [
        {
          id: 'tag-id-1',
          name: 'react',
          createdAt: new Date(),
        }
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTags);
      mockPrisma.tag.count.mockResolvedValue(1);

      const result = await tagService.findAll(filters);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'react', mode: 'insensitive' }
        },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10
      });
      expect(mockPrisma.tag.count).toHaveBeenCalledWith({
        where: {
          name: { contains: 'react', mode: 'insensitive' }
        }
      });
      expect(result.data).toEqual(mockTags);
    });
  });

  describe('findAllWithStats', () => {
    it('should find tags with usage counts', async () => {
      const filters: TagFilters = {
        page: 1,
        pageSize: 10
      };

      const mockTagsWithStats = [
        {
          id: 'tag-id-1',
          name: 'react',
          createdAt: new Date(),
          _count: { achievements: 8 }
        },
        {
          id: 'tag-id-2',
          name: 'typescript',
          createdAt: new Date(),
          _count: { achievements: 5 }
        }
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTagsWithStats);
      mockPrisma.tag.count.mockResolvedValue(2);

      const result = await tagService.findAllWithStats(filters);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
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
          id: 'tag-id-1',
          name: 'react',
          createdAt: expect.any(Date),
          usageCount: 8
        },
        {
          id: 'tag-id-2',
          name: 'typescript',
          createdAt: expect.any(Date),
          usageCount: 5
        }
      ]);
    });
  });

  describe('update', () => {
    it('should update tag successfully', async () => {
      const tagId = 'tag-id-1';
      const updateDto: UpdateTagDto = {
        name: 'reactjs'
      };

      const existingTag = {
        id: tagId,
        name: 'react',
        createdAt: new Date(),
      };

      const updatedTag = {
        ...existingTag,
        name: updateDto.name!.toLowerCase(),
      };

      mockPrisma.tag.findUnique.mockResolvedValueOnce(existingTag);
      mockPrisma.tag.findUnique.mockResolvedValueOnce(null); // name uniqueness check
      mockPrisma.tag.update.mockResolvedValue(updatedTag);

      const result = await tagService.update(tagId, updateDto);

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId }
      });
      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: 'reactjs' }
      });
      expect(mockPrisma.tag.update).toHaveBeenCalledWith({
        where: { id: tagId },
        data: {
          name: 'reactjs',
        }
      });
      expect(result).toEqual(updatedTag);
    });

    it('should throw error when tag not found', async () => {
      const tagId = 'non-existent-id';
      const updateDto: UpdateTagDto = {
        name: 'updated-tag'
      };

      mockPrisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagService.update(tagId, updateDto)).rejects.toThrow('Tag not found');
      expect(mockPrisma.tag.update).not.toHaveBeenCalled();
    });

    it('should throw error when new name already exists', async () => {
      const tagId = 'tag-id-1';
      const updateDto: UpdateTagDto = {
        name: 'existing-tag'
      };

      const existingTag = {
        id: tagId,
        name: 'react',
        createdAt: new Date(),
      };

      const conflictingTag = {
        id: 'other-id',
        name: 'existing-tag',
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValueOnce(existingTag);
      mockPrisma.tag.findUnique.mockResolvedValueOnce(conflictingTag);

      await expect(tagService.update(tagId, updateDto)).rejects.toThrow('Tag name already exists');
      expect(mockPrisma.tag.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same name', async () => {
      const tagId = 'tag-id-1';
      const updateDto: UpdateTagDto = {
        name: 'react'
      };

      const existingTag = {
        id: tagId,
        name: 'react',
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(existingTag);
      mockPrisma.tag.update.mockResolvedValue(existingTag);

      const result = await tagService.update(tagId, updateDto);

      expect(result).toEqual(existingTag);
    });
  });

  describe('delete', () => {
    it('should delete tag successfully when no achievements exist', async () => {
      const tagId = 'tag-id-1';

      const existingTag = {
        id: tagId,
        name: 'react',
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(existingTag);
      mockPrisma.achievementTag.count.mockResolvedValue(0);
      mockPrisma.tag.delete.mockResolvedValue(existingTag);

      const result = await tagService.delete(tagId);

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId }
      });
      expect(mockPrisma.achievementTag.count).toHaveBeenCalledWith({
        where: { tagId }
      });
      expect(mockPrisma.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId }
      });
      expect(result).toBe(true);
    });

    it('should throw error when tag not found', async () => {
      const tagId = 'non-existent-id';

      mockPrisma.tag.findUnique.mockResolvedValue(null);

      await expect(tagService.delete(tagId)).rejects.toThrow('Tag not found');
      expect(mockPrisma.achievementTag.count).not.toHaveBeenCalled();
      expect(mockPrisma.tag.delete).not.toHaveBeenCalled();
    });

    it('should throw error when tag has achievements', async () => {
      const tagId = 'tag-id-1';

      const existingTag = {
        id: tagId,
        name: 'react',
        createdAt: new Date(),
      };

      mockPrisma.tag.findUnique.mockResolvedValue(existingTag);
      mockPrisma.achievementTag.count.mockResolvedValue(3);

      await expect(tagService.delete(tagId)).rejects.toThrow('Cannot delete tag that is in use by achievements');
      expect(mockPrisma.tag.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByNames', () => {
    it('should find tags by array of names', async () => {
      const tagNames = ['react', 'typescript'];
      const mockTags = [
        {
          id: 'tag-id-1',
          name: 'react',
          createdAt: new Date(),
        },
        {
          id: 'tag-id-2',
          name: 'typescript',
          createdAt: new Date(),
        }
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTags);

      const result = await tagService.findByNames(tagNames);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { name: { in: tagNames } }
      });
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no names provided', async () => {
      const result = await tagService.findByNames([]);

      expect(mockPrisma.tag.findMany).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOrCreateByNames', () => {
    it('should find existing tags and create missing ones', async () => {
      const tagNames = ['react', 'vue', 'angular'];
      
      const existingTags = [
        {
          id: 'tag-id-1',
          name: 'react',
          createdAt: new Date(),
        }
      ];

      const newTags = [
        {
          id: 'tag-id-2',
          name: 'vue',
          createdAt: new Date(),
        },
        {
          id: 'tag-id-3',
          name: 'angular',
          createdAt: new Date(),
        }
      ];

      mockPrisma.tag.findMany.mockResolvedValue(existingTags);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          tag: {
            create: jest.fn()
              .mockResolvedValueOnce(newTags[0])
              .mockResolvedValueOnce(newTags[1]),
          }
        });
      });

      const result = await tagService.findOrCreateByNames(tagNames);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { name: { in: tagNames } }
      });
      expect(result).toEqual([...existingTags, ...newTags]);
    });

    it('should return existing tags when all exist', async () => {
      const tagNames = ['react', 'typescript'];
      
      const existingTags = [
        {
          id: 'tag-id-1',
          name: 'react',
          createdAt: new Date(),
        },
        {
          id: 'tag-id-2',
          name: 'typescript',
          createdAt: new Date(),
        }
      ];

      mockPrisma.tag.findMany.mockResolvedValue(existingTags);

      const result = await tagService.findOrCreateByNames(tagNames);

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { name: { in: tagNames } }
      });
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual(existingTags);
    });

    it('should return empty array when no names provided', async () => {
      const result = await tagService.findOrCreateByNames([]);

      expect(mockPrisma.tag.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});