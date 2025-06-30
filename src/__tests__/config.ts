// Mock Redis client to prevent actual Redis connections during tests
jest.mock("../lib/redis", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    isReady: false,
  },
  isRedisAvailable: jest.fn(() => false),
  getCache: jest.fn(() => Promise.resolve(null)),
  setCache: jest.fn(() => Promise.resolve(true)),
  deleteCache: jest.fn(() => Promise.resolve(true)),
}));

// Mock Prisma client
jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    books: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    reviews: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Increase timeout for integration tests
jest.setTimeout(10000);
