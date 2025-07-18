import request from 'supertest';
import app from '../src/app';
import { createTestUser } from './test-utils';
import { testUserData } from './test-data/fixtures';
import './setup'; // Import database setup

describe('Authentication API Integration Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create a test user
      const user = await createTestUser(testUserData.valid);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.valid.email,
          password: testUserData.valid.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUserData.valid.password
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 401 for invalid password', async () => {
      await createTestUser(testUserData.valid);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.valid.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.valid.email
          // missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: testUserData.valid.password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUserData.valid)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUserData.valid.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      // Create a user first
      await createTestUser(testUserData.valid);

      const response = await request(app)
        .post('/api/auth/register')
        .send(testUserData.valid)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUserData.invalidEmail)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authentication middleware', () => {
    it('should protect routes that require authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should allow access with valid token', async () => {
      const user = await createTestUser(testUserData.valid);

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.valid.email,
          password: testUserData.valid.password
        });

      const token = loginResponse.body.token;

      // Use token to access protected route
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
