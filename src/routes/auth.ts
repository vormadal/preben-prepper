import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { loginSchema } from '../schemas/user';
import { prisma } from '../lib/prisma';
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
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
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

export default router;
