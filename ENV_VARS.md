# Environment Variables

This file documents the environment variables used in the Preben Prepper API.

## Required Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string (required)

### JWT Authentication
- `JWT_SECRET` - Secret key for signing JWT tokens (required in production)
  - Default: "your-super-secret-jwt-key-change-this-in-production"
  - **IMPORTANT**: Change this in production!
- `JWT_EXPIRES_IN` - JWT token expiration time (optional)
  - Default: "7d" (7 days)
  - Examples: "1h", "24h", "7d", "30d"

### Server
- `PORT` - Server port (optional)
  - Default: 3000
- `NODE_ENV` - Environment mode (optional)
  - Values: "development", "production", "test"
  - Default: "development"
- `API_URL` - Base URL for the API (optional)
  - Default: "http://localhost:3000"
  - Used for Swagger documentation

## Example .env file

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/preben_prepper"

# JWT
JWT_SECRET="your-super-secure-jwt-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
API_URL="http://localhost:3000"
```

## Security Notes

1. **JWT_SECRET**: Must be a long, random, secure string in production
2. **DATABASE_URL**: Should use secure credentials and SSL in production
3. Never commit `.env` files to version control
4. Use different secrets for different environments (dev, staging, prod)
