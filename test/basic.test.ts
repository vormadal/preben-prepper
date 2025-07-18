import request from 'supertest';
import app from '../src/app';

// Simple tests that don't require database
describe('App Basic Tests', () => {
  describe('Health Check', () => {
    it('should respond with health check endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);

      expect(response.text).toContain('Swagger');
    });
  });

  describe('Not Found Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
