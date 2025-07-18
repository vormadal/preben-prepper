# JWT Authentication Implementation

This document describes the JWT authentication system implemented in the Preben Prepper API.

## Overview

The API now uses JSON Web Tokens (JWT) for stateless authentication. All protected routes require a valid JWT token to be included in the `Authorization` header.

## Authentication Flow

1. **Login**: User provides email/password to `/api/auth/login`
2. **Token Generation**: Server validates credentials and returns a JWT token
3. **Request Authentication**: Client includes token in subsequent requests
4. **Token Verification**: Server validates token on protected routes

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2025-07-18T...",
    "updatedAt": "2025-07-18T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Authentication successful"
}
```

#### POST `/api/auth/refresh`
Refresh JWT token (requires valid token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

#### GET `/api/auth/me`
Get current user profile (requires valid token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "defaultHomeId": null,
  "createdAt": "2025-07-18T...",
  "updatedAt": "2025-07-18T..."
}
```

## Protected Routes

All routes except `/api/health` and `/api/auth/login` now require authentication:

- `/api/users/*` - User management
- `/api/homes/*` - Home management  
- `/api/home/:homeId/inventory/*` - Inventory management
- `/api/recommended-inventory/*` - Recommended inventory
- `/api/admin/*` - Admin operations

## Usage

### Client Implementation

1. **Login and Store Token:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

2. **Include Token in Requests:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

3. **Handle Token Refresh:**
```javascript
// If token expires, refresh it
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const refreshData = await refreshResponse.json();
localStorage.setItem('token', refreshData.token);
```

## Security Features

### 1. JWT Token Security
- Tokens are signed with `JWT_SECRET` environment variable
- Default expiration: 7 days (configurable)
- Includes user ID and email in payload

### 2. Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

### 3. Route Protection
- All protected routes validate JWT tokens
- User context available in `req.user` after authentication
- Invalid/expired tokens return 403 Forbidden

### 4. Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Passwords excluded from API responses

### 5. Input Validation
- Comprehensive Zod schema validation
- Request sanitization and validation

## Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "message": "Access token required",
    "status": 401
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "message": "Invalid or expired token",
    "status": 403
  }
}
```

### 429 Too Many Requests
```json
{
  "error": {
    "message": "Too many authentication attempts, please try again later.",
    "status": 429
  }
}
```

## Changes Made

### New Files
- `src/lib/jwt.ts` - JWT utility functions
- `src/middleware/auth.ts` - Authentication middleware
- `ENV_VARS.md` - Environment variables documentation

### Modified Files
- `src/index.ts` - Added rate limiting and auth middleware
- `src/routes/auth.ts` - Added JWT token generation and refresh endpoints
- `src/routes/*.ts` - Added authentication to all protected routes
- `src/config/swagger.ts` - Added JWT bearer auth to Swagger docs
- `src/schemas/inventoryItem.ts` - Removed userId from request schemas

### Behavior Changes
- User ID now comes from JWT token instead of request parameters
- All routes (except health and login) require authentication
- Home and inventory operations use authenticated user context
- Rate limiting applied to prevent abuse

## Environment Variables

See `ENV_VARS.md` for required environment variables, especially:
- `JWT_SECRET` - **Must be changed in production**
- `JWT_EXPIRES_IN` - Token expiration time

## Next Steps (Recommendations)

1. **Role-Based Authorization**: Add user roles and protect admin routes
2. **Token Blacklisting**: Implement token revocation for logout
3. **Refresh Token Strategy**: Separate access and refresh tokens
4. **API Key Authentication**: For service-to-service communication
5. **Session Management**: Optional session-based auth for web clients
6. **HTTPS Enforcement**: Ensure secure token transmission
