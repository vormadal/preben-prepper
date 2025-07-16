import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Preben Prepper API',
      version: '1.0.0',
      description: 'REST API for Preben Prepper application',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
          },
        },
        InventoryItem: {
          type: 'object',
          required: ['id', 'name', 'quantity', 'expirationDate', 'homeId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Inventory item ID',
            },
            name: {
              type: 'string',
              description: 'Item name',
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Item quantity',
            },
            expirationDate: {
              type: 'string',
              format: 'date',
              description: 'Item expiration date',
            },
            homeId: {
              type: 'integer',
              description: 'ID of the home this item belongs to',
            },
            home: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: 'Home ID',
                },
                name: {
                  type: 'string',
                  description: 'Home name',
                },
              },
              description: 'Basic home details',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Item creation timestamp',
            },
          },
        },
        RecommendedInventoryItem: {
          type: 'object',
          required: ['id', 'name', 'expiresIn', 'quantity', 'isOptional', 'description'],
          properties: {
            id: {
              type: 'integer',
              description: 'Recommended inventory item ID',
            },
            name: {
              type: 'string',
              description: 'Item name',
            },
            expiresIn: {
              type: 'integer',
              minimum: 1,
              description: 'Number of days until expiration',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Recommended quantity',
            },
            isOptional: {
              type: 'boolean',
              description: 'Whether this item is optional for preppers',
            },
            description: {
              type: 'string',
              description: 'Item description',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Item creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Item last update timestamp',
            },
          },
        },
        Home: {
          type: 'object',
          required: ['id', 'name', 'numberOfAdults', 'numberOfChildren', 'numberOfPets', 'ownerId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Home ID',
            },
            name: {
              type: 'string',
              description: 'Home name',
            },
            numberOfAdults: {
              type: 'integer',
              minimum: 1,
              description: 'Number of adults in the home',
            },
            numberOfChildren: {
              type: 'integer',
              minimum: 0,
              description: 'Number of children in the home',
            },
            numberOfPets: {
              type: 'integer',
              minimum: 0,
              description: 'Number of pets in the home',
            },
            ownerId: {
              type: 'integer',
              description: 'User ID of the home owner',
            },
            owner: {
              $ref: '#/components/schemas/User',
              description: 'Home owner details',
            },
            homeAccesses: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/HomeAccess',
              },
              description: 'List of users with access to this home',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Home creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Home last update timestamp',
            },
          },
        },
        HomeAccess: {
          type: 'object',
          required: ['id', 'userId', 'homeId', 'role'],
          properties: {
            id: {
              type: 'integer',
              description: 'Home access ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID with access',
            },
            homeId: {
              type: 'integer',
              description: 'Home ID',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MEMBER'],
              description: 'User role for this home',
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'User details',
            },
            home: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: 'Home ID',
                },
                name: {
                  type: 'string',
                  description: 'Home name',
                },
              },
              description: 'Basic home details',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Access grant timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Access last update timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            status: {
              type: 'integer',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Serve the OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Serve the Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));
};
