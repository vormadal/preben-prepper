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
          required: ['id', 'name', 'quantity', 'expirationDate'],
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
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Item creation timestamp',
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
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));
};
