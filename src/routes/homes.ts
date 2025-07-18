import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createHomeSchema,
  homeAccessSchema,
  homeParamsSchema
} from '../schemas/home';

const router: Router = Router();

/**
 * @swagger
 * /api/homes:
 *   get:
 *     summary: Get all homes where user has access
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of homes user has access to
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Home'
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
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

    const userId = req.user.userId;

    const homes = await prisma.home.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            homeAccesses: {
              some: { userId }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        homeAccesses: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { inventoryItems: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(homes);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch homes',
        status: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/homes/{id}:
 *   get:
 *     summary: Get home by ID
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID
 *     responses:
 *       200:
 *         description: Home found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Home'
 *       404:
 *         description: Home not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  authenticateToken,
  validateRequest({ params: homeParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
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

      const { id } = req.params;
      const userId = req.user.userId;

      const home = await prisma.home.findFirst({
        where: {
          id: Number(id),
          OR: [
            { ownerId: userId },
            {
              homeAccesses: {
                some: { userId }
              }
            }
          ]
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          homeAccesses: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { inventoryItems: true }
          }
        }
      });
      
      if (!home) {
        res.status(404).json({
          error: {
            message: 'Home not found or access denied',
            status: 404,
          },
        });
        return;
      }
      
      res.json(home);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to fetch home',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/homes:
 *   post:
 *     summary: Create a new home
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Home name
 *               numberOfAdults:
 *                 type: integer
 *                 description: Number of adults in the home
 *                 default: 2
 *               numberOfChildren:
 *                 type: integer
 *                 description: Number of children in the home
 *                 default: 0
 *               numberOfPets:
 *                 type: integer
 *                 description: Number of pets in the home
 *                 default: 0
 *     responses:
 *       201:
 *         description: Home created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Home'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticateToken,
  validateRequest({ body: createHomeSchema }),
  async (req: Request, res: Response): Promise<void> => {
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

      const { name, numberOfAdults, numberOfChildren, numberOfPets } = req.body;
      const ownerId = req.user.userId;
      
      const newHome = await prisma.home.create({
        data: {
          name,
          numberOfAdults: numberOfAdults || 2,
          numberOfChildren: numberOfChildren || 0,
          numberOfPets: numberOfPets || 0,
          ownerId,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          homeAccesses: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { inventoryItems: true }
          }
        }
      });
      
      res.status(201).json(newHome);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to create home',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/homes/{id}/access:
 *   post:
 *     summary: Grant access to a home (owner or admin only)
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID to grant access to
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *                 default: MEMBER
 *                 description: Role to assign
 *     responses:
 *       201:
 *         description: Access granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomeAccess'
 */
router.post(
  '/:id/access',
  authenticateToken,
  validateRequest({ params: homeParamsSchema, body: homeAccessSchema }),
  async (req: Request, res: Response): Promise<void> => {
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

      const { id } = req.params;
      const requesterId = req.user.userId;
      const { userId, role } = req.body;
      
      // Check if requester is owner or admin
      const home = await prisma.home.findFirst({
        where: {
          id: Number(id),
          OR: [
            { ownerId: requesterId },
            {
              homeAccesses: {
                some: {
                  userId: requesterId,
                  role: 'ADMIN'
                }
              }
            }
          ]
        }
      });
      
      if (!home) {
        res.status(403).json({
          error: {
            message: 'Access denied or home not found',
            status: 403,
          },
        });
        return;
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        res.status(400).json({
          error: {
            message: 'User not found',
            status: 400,
          },
        });
        return;
      }
      
      // Check if user is the owner (owners don't need access records)
      if (home.ownerId === userId) {
        res.status(400).json({
          error: {
            message: 'Cannot grant access to home owner',
            status: 400,
          },
        });
        return;
      }
      
      // Check if access already exists
      const existingAccess = await prisma.homeAccess.findUnique({
        where: {
          userId_homeId: {
            userId,
            homeId: Number(id),
          },
        },
      });
      
      if (existingAccess) {
        res.status(400).json({
          error: {
            message: 'User already has access to this home',
            status: 400,
          },
        });
        return;
      }
      
      const homeAccess = await prisma.homeAccess.create({
        data: {
          userId,
          homeId: Number(id),
          role: role || 'MEMBER',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          home: {
            select: { id: true, name: true }
          }
        }
      });
      
      res.status(201).json(homeAccess);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to grant home access',
          status: 500,
        },
      });
    }
  }
);

export default router;
