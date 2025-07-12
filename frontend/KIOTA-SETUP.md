# Kiota API Client Setup

This project uses [Microsoft Kiota](https://github.com/microsoft/kiota) to generate a TypeScript client from the OpenAPI specification.

## Prerequisites

- Node.js and npm installed
- Backend server running on `http://localhost:3000`
- Kiota CLI installed globally (`npm install -g @microsoft/kiota`)

## How it works

1. **OpenAPI Specification**: The backend server exposes an OpenAPI specification at `http://localhost:3000/api-docs/swagger.json`
2. **Client Generation**: Kiota generates a TypeScript client based on this specification
3. **API Integration**: The generated client is used in the frontend through a wrapper service

## Usage

### Generate the API client

```bash
# From the frontend directory
npm run generate-client
```

This will:
- Download the OpenAPI specification from the backend
- Generate a TypeScript client in `src/generated/`
- Clean up any existing generated files

### Build the project

The client generation is automatically run before building:

```bash
npm run build
```

### Development workflow

1. Start the backend server
2. Make changes to the API
3. Run `npm run generate-client` to update the client
4. The frontend will automatically use the updated client

## Configuration

The client generation is configured in `kiota-config.json`:

```json
{
  "version": "1.0.0",
  "clients": {
    "PrebenPrepperApiClient": {
      "descriptionLocation": "http://localhost:3000/api-docs/swagger.json",
      "language": "TypeScript",
      "outputPath": "./src/generated",
      "clientClassName": "PrebenPrepperApiClient"
    }
  }
}
```

## API Usage

The generated client is wrapped in `src/lib/kiota-api.ts` and consumed through React hooks in `src/hooks/useApi.ts`:

```typescript
import { useUsers, useCreateUser } from '@/hooks/useApi';

function MyComponent() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();

  // Use the hooks as before - the implementation now uses Kiota
}
```

## Benefits of using Kiota

- **Type Safety**: Fully typed client based on OpenAPI specification
- **Automatic Updates**: Client stays in sync with API changes
- **Better Developer Experience**: IntelliSense and compile-time checking
- **Standardized**: Uses Microsoft's standard HTTP client libraries
- **Error Handling**: Consistent error handling across all endpoints

## Troubleshooting

### "Failed to download OpenAPI specification"
- Ensure the backend server is running on `http://localhost:3000`
- Check that the API documentation is accessible at `http://localhost:3000/api-docs`

### "kiota command not found"
- Install Kiota CLI: `npm install -g @microsoft/kiota`
- Verify installation: `kiota --version`

### Generated client not found
- Run `npm run generate-client` to generate the client
- Check that files are created in `src/generated/`
