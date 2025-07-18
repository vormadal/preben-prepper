import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { loginSchema, createUserSchema } from '../schemas/user';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import bcrypt from 'bcryptjs';

const router: Router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        res.status(401).json({
          error: {
            message: 'Invalid credentials',
            status: 401,
          },
        });
        return;
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        res.status(401).json({
          error: {
            message: 'Invalid credentials',
            status: 401,
          },
        });
        return;
      }
      
      // Return user data without password and generate JWT token
      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(user.id, user.email);
      
      res.json({
        user: userWithoutPassword,
        token,
        message: 'Authentication successful',
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Authentication failed',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
router.post(
  '/register',
  validateRequest({ body: createUserSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        res.status(409).json({
          error: {
            message: 'Email already exists',
            status: 409,
          },
        });
        return;
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true, defaultHomeId: true, createdAt: true, updatedAt: true }
      });
      
      // Generate JWT token
      const token = generateToken(newUser.id, newUser.email);
      
      res.status(201).json({
        user: newUser,
        token,
        message: 'User registered successfully',
      });
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Registration failed',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *                 message:
 *                   type: string
 *       401:
 *         description: Token required
 *       403:
 *         description: Invalid or expired token
 */
router.post('/refresh', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          status: 401,
        },
      });
      return;
    }

    // Generate new token
    const token = generateToken(req.user.userId, req.user.email);

    res.json({
      token,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Token refresh failed',
        status: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token required
 *       403:
 *         description: Invalid or expired token
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          status: 401,
        },
      });
      return;
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        defaultHomeId: true,
        createdAt: true, 
        updatedAt: true 
      }
    });

    if (!user) {
      res.status(404).json({
        error: {
          message: 'User not found',
          status: 404,
        },
      });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to get user profile',
        status: 500,
      },
    });
  }
});

export default router;
