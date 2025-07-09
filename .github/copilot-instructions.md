# Project tools and libraries
- Do not try to start or restart the application after making changes

## Frontend Project
- NextJS application using TypeScript
- ShadCN for default components and Tailwind CSS for styling
- Tanstack Query for data fetching
- Components should be optimized for mobile over desktop
- Jest and React Testing Library for testing

## Backend Project
- Node.js application using TypeScript
- Express.js for the server framework
- swagger-jsdoc for API documentation
- swagger-ui-express for serving the API documentation
- Prisma for database ORM
- PostgreSQL as the database
- Zod for request validation
- Jest for testing

## Coding Standards
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Use async/await over promises
- Implement proper error handling with try-catch blocks
- Use meaningful variable and function names

## File Structure
- Use kebab-case for file names
- Group related files in feature folders
- Keep components small and focused
- Use barrel exports (index.ts) for cleaner imports

## API Development
- Use RESTful conventions
- Implement proper HTTP status codes
- Include request/response validation with Zod
- Add comprehensive API documentation with Swagger