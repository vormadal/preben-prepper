import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { createUserSchema, updateUserSchema, userParamsSchema } from '../schemas/user';
import { prisma } from '../lib/prisma';

const router: Router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch users',
        status: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validateRequest({ params: userParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
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
          message: 'Failed to fetch user',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: User name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validateRequest({ body: createUserSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        res.status(400).json({
          error: {
            message: 'Email already exists',
            status: 400,
          },
        });
        return;
      }
      
      const newUser = await prisma.user.create({
        data: { name, email },
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to create user',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  validateRequest({ params: userParamsSchema, body: updateUserSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
      
      if (!existingUser) {
        res.status(404).json({
          error: {
            message: 'User not found',
            status: 404,
          },
        });
        return;
      }
      
      // Check if email already exists (excluding current user)
      if (email) {
        const emailUser = await prisma.user.findFirst({
          where: {
            email,
            id: { not: Number(id) },
          },
        });
        
        if (emailUser) {
          res.status(400).json({
            error: {
              message: 'Email already exists',
              status: 400,
            },
          });
          return;
        }
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to update user',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  validateRequest({ params: userParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
      
      if (!existingUser) {
        res.status(404).json({
          error: {
            message: 'User not found',
            status: 404,
          },
        });
        return;
      }
      
      await prisma.user.delete({
        where: { id: Number(id) },
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to delete user',
          status: 500,
        },
      });
    }
  }
);

export default router;
