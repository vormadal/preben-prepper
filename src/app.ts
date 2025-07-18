import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import homeRoutes from './routes/homes';
import adminRecommendedInventoryRoutes from './routes/admin/recommended-inventory';
import recommendedInventoryRoutes from './routes/recommended-inventory';

export const createApp = (): Express => {
  const app: Express = express();

  // Rate limiting - disabled for tests
  if (process.env.NODE_ENV !== 'test') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: {
          message: 'Too many requests from this IP, please try again later.',
          status: 429,
        },
      },
    });

    // Auth-specific rate limiting (more restrictive)
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
      message: {
        error: {
          message: 'Too many authentication attempts, please try again later.',
          status: 429,
        },
      },
    });

    app.use(limiter);
    app.use('/api/auth', authLimiter);
  }

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Logging middleware
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup Swagger documentation
  setupSwagger(app);

  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/homes', homeRoutes);
  app.use('/api/home/:homeId/inventory', inventoryRoutes);
  app.use('/api/recommended-inventory', recommendedInventoryRoutes);
  app.use('/api/admin/recommended-inventory', adminRecommendedInventoryRoutes);

  // Error handling middleware
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp();
