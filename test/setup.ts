import { PrismaClient } from '@prisma/client';

// Set test environment
process.env.NODE_ENV = 'test';

// Initialize test database client using the environment variable
const prisma = new PrismaClient();

// Global test timeout
jest.setTimeout(30000);

// Global setup and teardown
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Disconnect from test database
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  // Clean all tables in correct order to avoid foreign key constraints
  await prisma.inventoryItem.deleteMany();
  await prisma.recommendedInventoryItem.deleteMany();
  await prisma.homeAccess.deleteMany();
  await prisma.home.deleteMany();
  await prisma.user.deleteMany();
});

export { prisma };
