# Integration Testing Setup

This project uses Jest and Supertest for integration testing of the backend API.

## Test Database Setup

### 1. Create Test Database

Create a separate PostgreSQL database for testing:

```sql
CREATE DATABASE preben_prepper_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE preben_prepper_test TO test_user;
```

### 2. Environment Configuration

Copy the example environment file and configure your test database:

```bash
cp .env.test.example .env.test
```

Update `.env.test` with your test database credentials:

```env
TEST_DATABASE_URL="postgresql://test_user:test_password@localhost:5432/preben_prepper_test"
JWT_SECRET="test-jwt-secret-key-for-testing-only"
NODE_ENV="test"
```

### 3. Setup Test Database Schema

Run Prisma migrations on the test database:

```bash
npm run db:test:setup
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Reset Test Database
```bash
npm run db:test:reset
```

## Test Structure

```
test/
├── setup.ts                 # Global test setup and database configuration
├── test-utils.ts            # Helper functions for creating test data
├── test-data/
│   └── fixtures.ts          # Test data fixtures
├── app.test.ts              # Basic app functionality tests
├── auth.test.ts             # Authentication endpoint tests
├── users.test.ts            # User CRUD endpoint tests
└── [other-endpoint].test.ts # Additional endpoint tests
```

## Writing Tests

### Test Structure

Each test file should follow this pattern:

```typescript
import request from 'supertest';
import app from '../src/app';
import { createTestUser } from './test-utils';

describe('API Feature Tests', () => {
  describe('POST /api/endpoint', () => {
    it('should handle valid request', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send(validData)
        .expect(200);

      expect(response.body).toHaveProperty('expectedProperty');
    });

    it('should handle invalid request', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### Test Utilities

Use the provided test utilities to create test data:

```typescript
import { 
  createTestUser, 
  createTestHome, 
  createTestInventoryItem,
  grantHomeAccess 
} from './test-utils';

// Create test user
const user = await createTestUser({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
});

// Create test home
const home = await createTestHome(user.id, {
  name: 'Test Home'
});
```

### Authentication Testing

For endpoints that require authentication:

```typescript
// Login to get token
const loginResponse = await request(app)
  .post('/api/auth/login')
  .send({ email: 'test@example.com', password: 'password123' });

const token = loginResponse.body.token;

// Use token in subsequent requests
const response = await request(app)
  .get('/api/protected-endpoint')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

## Database Isolation

Each test runs with a clean database:

- `beforeEach`: Cleans all tables before each test
- `beforeAll`: Connects to test database
- `afterAll`: Disconnects from test database

This ensures tests don't interfere with each other.

## Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Test both success and failure cases** for each endpoint
3. **Use test fixtures** for consistent test data
4. **Clean up after tests** (handled automatically by setup)
5. **Mock external dependencies** when necessary
6. **Test authentication and authorization** scenarios
7. **Verify response structure** and data types
8. **Test edge cases** and boundary conditions

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check database credentials in `.env.test`
3. Verify test database exists and user has permissions
4. Run `npm run db:test:setup` to apply migrations

### Test Failures

1. Check if database is properly reset between tests
2. Verify test data creation in test utilities
3. Ensure environment variables are set correctly
4. Check for timing issues with async operations

### Performance Issues

1. Use database transactions for faster cleanup
2. Minimize database operations in tests
3. Use test data factories for efficient data creation
4. Consider using in-memory database for faster tests
