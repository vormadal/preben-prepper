import { PrismaClient, HomeRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app';

const prisma = new PrismaClient();

export const createTestUser = async (userData: {
  name?: string;
  email?: string;
  password?: string;
} = {}) => {
  const hashedPassword = await bcrypt.hash(userData.password || 'password123', 10);
  
  return await prisma.user.create({
    data: {
      name: userData.name || 'Test User',
      email: userData.email || `test${Date.now()}@example.com`,
      password: hashedPassword
    }
  });
};

export const getAuthToken = async (userData: {
  name?: string;
  email?: string;
  password?: string;
} = {}) => {
  const user = await createTestUser(userData);
  
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: userData.password || 'password123'
    });
    
  return {
    token: response.body.token,
    user
  };
};

export const createTestHome = async (userId: number, homeData: {
  name?: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfPets?: number;
} = {}) => {
  return await prisma.home.create({
    data: {
      name: homeData.name || 'Test Home',
      numberOfAdults: homeData.numberOfAdults || 2,
      numberOfChildren: homeData.numberOfChildren || 0,
      numberOfPets: homeData.numberOfPets || 0,
      ownerId: userId
    }
  });
};

export const createTestInventoryItem = async (homeId: number, itemData: {
  name?: string;
  quantity?: number;
  expirationDate?: Date;
} = {}) => {
  return await prisma.inventoryItem.create({
    data: {
      name: itemData.name || 'Test Item',
      quantity: itemData.quantity || 1,
      expirationDate: itemData.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      homeId
    }
  });
};

export const createTestRecommendedItem = async (itemData: {
  name?: string;
  description?: string;
  expiresIn?: number;
  quantity?: number;
  isOptional?: boolean;
} = {}) => {
  return await prisma.recommendedInventoryItem.create({
    data: {
      name: itemData.name || 'Test Recommended Item',
      description: itemData.description || 'Test description',
      expiresIn: itemData.expiresIn || 30,
      quantity: itemData.quantity || 1,
      isOptional: itemData.isOptional || false
    }
  });
};

export const grantHomeAccess = async (userId: number, homeId: number, role: HomeRole = HomeRole.MEMBER) => {
  return await prisma.homeAccess.create({
    data: {
      userId,
      homeId,
      role
    }
  });
};

export const clearDatabase = async () => {
  // Clean all tables in correct order to avoid foreign key constraints
  await prisma.inventoryItem.deleteMany();
  await prisma.recommendedInventoryItem.deleteMany();
  await prisma.homeAccess.deleteMany();
  await prisma.home.deleteMany();
  await prisma.user.deleteMany();
};

export { prisma };
