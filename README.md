# Preben Prepper Backend API

A comprehensive REST API built with TypeScript and Express.js for home inventory management with JWT authentication.

## Features

- **TypeScript** for type safety
- **Express.js** for the web framework
- **JWT Authentication** with token-based security
- **Prisma ORM** with PostgreSQL database
- **Swagger/OpenAPI** documentation
- **Zod** for request validation
- **Rate Limiting** for API protection
- **CORS** and **Helmet** for security
- **Morgan** for logging
- **bcrypt** for password hashing

## Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Input validation and sanitization
- ✅ CORS and Helmet security headers
- ✅ Protected routes requiring authentication
- ✅ SQL injection protection via Prisma ORM

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` file with your configuration (see `ENV_VARS.md` for details):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/preben_prepper"
   JWT_SECRET="your-super-secure-jwt-secret-key"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   ```

3. Set up the database:
   ```bash
   npm run db
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

4. View API documentation:
   Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get inventory item by ID
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

**Note**: Multiple inventory items can have the same name, allowing you to track different batches or expiration dates of the same product.

## Project Structure

```
src/
├── config/          # Configuration files
│   └── swagger.ts   # Swagger/OpenAPI setup
├── middleware/      # Express middleware
│   ├── errorHandler.ts
│   ├── notFoundHandler.ts
│   └── validation.ts
├── routes/          # API route handlers
│   ├── health.ts
│   └── users.ts
├── schemas/         # Zod validation schemas
│   └── user.ts
└── index.ts         # Application entry point
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string (for Prisma)

## Next Steps

1. Set up PostgreSQL database
2. Configure Prisma schema
3. Add authentication middleware
4. Add rate limiting
5. Add comprehensive logging
6. Add tests
