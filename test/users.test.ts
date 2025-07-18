import request from 'supertest';
import app from '../src/app';
import { createTestUser, createTestHome, getAuthToken } from './test-utils';
import { testUserData, testHomeData } from './test-data/fixtures';
import '../test/setup'; // Import database setup

describe('User API Integration Tests', () => {
  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(testUserData.valid)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUserData.valid.email);
      expect(response.body.name).toBe(testUserData.valid.name);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(testUserData.invalidEmail)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(testUserData.missingName)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
      // Create a user first
      await createTestUser(testUserData.valid);

      // Try to create another user with the same email
      const response = await request(app)
        .post('/api/users')
        .send(testUserData.valid)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Get auth token
      const { token } = await getAuthToken(testUserData.valid);
      
      // Create test users
      await createTestUser({ ...testUserData.admin, email: 'different@example.com' });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should return empty array when no users exist', async () => {
      // Get auth token first (this creates one user)
      const { token } = await getAuthToken(testUserData.valid);
      
      // Clear all users after getting token but before the test
      const { prisma } = await import('./setup');
      await prisma.user.deleteMany();

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      const user = await createTestUser({ ...testUserData.admin, email: 'different@example.com' });

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid user id', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      
      const response = await request(app)
        .get('/api/users/invalid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      const user = await createTestUser({ ...testUserData.admin, email: 'different@example.com' });
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      
      const response = await request(app)
        .put('/api/users/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      const user = await createTestUser({ ...testUserData.admin, email: 'different@example.com' });

      await request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify user is deleted
      await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await getAuthToken(testUserData.valid);
      
      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
