# Integration Testing Setup Guide

This guide explains how to set up and run integration tests for the Preben Prepper backend API.

## Overview

The testing setup includes:
- **Jest** for the testing framework
- **Supertest** for HTTP endpoint testing
- **Separate test database** to avoid conflicts with development data
- **TypeScript support** for type-safe tests

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install --save-dev jest @types/jest supertest @types/supertest ts-jest dotenv-cli
```

### 2. Run Basic Tests (No Database Required)
```bash
npm run test:basic
```

### 3. Set Up Test Database (For Integration Tests)

#### Create PostgreSQL Test Database:
```sql
-- Connect to PostgreSQL as admin user
CREATE DATABASE preben_prepper_test;
CREATE USER test_user WITH ENCRYPTED PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE preben_prepper_test TO test_user;
GRANT ALL ON SCHEMA public TO test_user;
ALTER DATABASE preben_prepper_test OWNER TO test_user;
```

#### Create Test Environment File:
```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your database details:
```env
TEST_DATABASE_URL="postgresql://test_user:test_password@localhost:5432/preben_prepper_test"
JWT_SECRET="test-jwt-secret-key-for-testing-only"
NODE_ENV="test"
```

#### Set Up Database Schema:
```bash
npm run db:test:setup
```

### 4. Run Integration Tests
```bash
npm run test:integration
```

## Available Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (basic only, no database required) |
| `npm run test:basic` | Run basic app tests (no database required) |
| `npm run test:integration` | Run full integration tests (requires test database) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:test:setup` | Apply database migrations to test database |
| `npm run db:test:reset` | Reset test database |

## Test Structure

```
test/
├── README.md                 # This file
├── setup.ts                  # Database setup for integration tests
├── test-utils.ts            # Helper functions for creating test data
├── test-data/
│   └── fixtures.ts          # Test data fixtures
├── basic.test.ts            # Basic app tests (no database)
├── app.test.ts              # App setup tests (no database)
├── auth.test.ts             # Authentication integration tests
├── users.test.ts            # User CRUD integration tests
└── [feature].test.ts        # Additional feature tests
```

## Configuration Files

- `jest.config.js` - Basic Jest configuration (no database setup)
- `jest.integration.config.js` - Integration test configuration (with database setup)

## Writing Tests

### Basic Tests (No Database)
```typescript
import request from 'supertest';
import app from '../src/app';

describe('Feature Tests', () => {
  it('should test endpoint', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('expected');
  });
});
```

### Integration Tests (With Database)
```typescript
import request from 'supertest';
import app from '../src/app';
import { createTestUser } from './test-utils';
import './setup'; // Important: Include database setup

describe('Integration Tests', () => {
  it('should test with database', async () => {
    const user = await createTestUser();
    
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .expect(201);

    expect(response.body.id).toBe(user.id);
  });
});
```

## Test Utilities

The test suite includes utilities for creating test data:

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

## Authentication in Tests

For endpoints requiring authentication:

```typescript
// Get token
const loginResponse = await request(app)
  .post('/api/auth/login')
  .send({ email: 'test@example.com', password: 'password123' });

const token = loginResponse.body.token;

// Use token
const response = await request(app)
  .get('/api/protected-endpoint')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Verify database exists: `psql -U test_user -d preben_prepper_test`
3. Check credentials in `.env.test`
4. Run: `npm run db:test:setup`

### Test Failures
1. Reset test database: `npm run db:test:reset`
2. Check test isolation (database cleanup between tests)
3. Verify test data creation

### Performance Issues
1. Use appropriate test timeouts
2. Consider database transactions for faster cleanup
3. Optimize test data creation

## Best Practices

1. **Start with basic tests** - Test core functionality without database dependencies
2. **Use test utilities** - Create reusable functions for common test data
3. **Test edge cases** - Include validation, error handling, and boundary conditions
4. **Isolate tests** - Each test should be independent and clean up after itself
5. **Mock external dependencies** - Focus on testing your API, not third-party services
6. **Descriptive test names** - Make it clear what each test is verifying

## Next Steps

1. **Set up CI/CD** - Add test database setup to your deployment pipeline
2. **Add more test coverage** - Create tests for remaining endpoints
3. **Performance testing** - Consider load testing for critical endpoints
4. **End-to-end testing** - Test full user workflows across multiple endpoints
