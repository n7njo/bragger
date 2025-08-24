import { PrismaClient } from '@prisma/client';

// Mock Prisma client for tests
const mockPrisma = {
  achievement: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  tag: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  achievementTag: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
  },
  achievementImage: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock the prisma module
jest.mock('../services/database', () => ({
  prisma: mockPrisma,
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

export { mockPrisma };