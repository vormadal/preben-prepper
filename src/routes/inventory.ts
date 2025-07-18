import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { createInventoryItemSchema, updateInventoryItemSchema, homeInventoryParamsSchema } from '../schemas/inventoryItem';
import { prisma } from '../lib/prisma';

const router: Router = Router({ mergeParams: true });

// Helper function to check if user has access to a home
async function checkHomeAccess(userId: number, homeId: number): Promise<boolean> {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      OR: [
        { ownerId: userId },
        {
          homeAccesses: {
            some: { userId }
          }
        }
      ]
    }
  });
  
  return !!home;
}

/**
 * @swagger
 * /api/home/{homeId}/inventory:
 *   get:
 *     summary: Get inventory items for a specific home
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID to get inventory for
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to verify access
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryItem'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    const homeId = Number(req.params.homeId);
    
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        error: {
          message: 'Valid user ID is required',
          status: 400,
        },
      });
      return;
    }

    if (!homeId || isNaN(homeId)) {
      res.status(400).json({
        error: {
          message: 'Valid home ID is required',
          status: 400,
        },
      });
      return;
    }

    // Verify user has access to this home
    const hasAccess = await checkHomeAccess(userId, homeId);
    if (!hasAccess) {
      res.status(403).json({
        error: {
          message: 'Access denied to this home',
          status: 403,
        },
      });
      return;
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        homeId: homeId
      },
      include: {
        home: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch inventory items',
        status: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/home/{homeId}/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID requesting access
 *     responses:
 *       200:
 *         description: Inventory item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Inventory item not found
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
  validateRequest({ params: homeInventoryParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const homeId = Number(req.params.homeId);
      const userId = Number(req.query.userId);
      
      if (!userId || isNaN(userId)) {
        res.status(400).json({
          error: {
            message: 'Valid user ID is required',
            status: 400,
          },
        });
        return;
      }

      if (!homeId || isNaN(homeId)) {
        res.status(400).json({
          error: {
            message: 'Valid home ID is required',
            status: 400,
          },
        });
        return;
      }

      // Verify user has access to this home
      const hasAccess = await checkHomeAccess(userId, homeId);
      if (!hasAccess) {
        res.status(403).json({
          error: {
            message: 'Access denied to this home',
            status: 403,
          },
        });
        return;
      }

      const item = await prisma.inventoryItem.findFirst({
        where: {
          id: Number(id),
          homeId: homeId
        },
        include: {
          home: {
            select: { id: true, name: true }
          }
        }
      });
      
      if (!item) {
        res.status(404).json({
          error: {
            message: 'Inventory item not found',
            status: 404,
          },
        });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to fetch inventory item',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/home/{homeId}/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID where the item will be created
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *               - expirationDate
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Item quantity
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Item expiration date
 *               userId:
 *                 type: integer
 *                 minimum: 1
 *                 description: User ID creating the item
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Validation error
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
router.post(
  '/',
  validateRequest({ body: createInventoryItemSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, quantity, expirationDate, userId } = req.body;
      const homeId = Number(req.params.homeId);
      
      if (!userId || isNaN(userId)) {
        res.status(400).json({
          error: {
            message: 'Valid user ID is required',
            status: 400,
          },
        });
        return;
      }

      if (!homeId || isNaN(homeId)) {
        res.status(400).json({
          error: {
            message: 'Valid home ID is required',
            status: 400,
          },
        });
        return;
      }
      
      // Verify user has access to this home
      const hasAccess = await checkHomeAccess(userId, homeId);
      if (!hasAccess) {
        res.status(403).json({
          error: {
            message: 'Access denied to this home',
            status: 403,
          },
        });
        return;
      }
      
      const newItem = await prisma.inventoryItem.create({
        data: {
          name,
          quantity,
          expirationDate: new Date(expirationDate),
          homeId,
        },
        include: {
          home: {
            select: { id: true, name: true }
          }
        }
      });
      
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to create inventory item',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/home/{homeId}/inventory/{id}:
 *   put:
 *     summary: Update inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID requesting the update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Item quantity
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Item expiration date
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Inventory item not found
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
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  validateRequest({ params: homeInventoryParamsSchema, body: updateInventoryItemSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const homeId = Number(req.params.homeId);
      const userId = Number(req.query.userId);
      const { name, quantity, expirationDate } = req.body;
      
      if (!userId || isNaN(userId)) {
        res.status(400).json({
          error: {
            message: 'Valid user ID is required',
            status: 400,
          },
        });
        return;
      }

      if (!homeId || isNaN(homeId)) {
        res.status(400).json({
          error: {
            message: 'Valid home ID is required',
            status: 400,
          },
        });
        return;
      }

      // Verify user has access to this home
      const hasAccess = await checkHomeAccess(userId, homeId);
      if (!hasAccess) {
        res.status(403).json({
          error: {
            message: 'Access denied to this home',
            status: 403,
          },
        });
        return;
      }
      
      // Check if item exists and belongs to the specified home
      const existingItem = await prisma.inventoryItem.findFirst({
        where: { 
          id: Number(id),
          homeId: homeId
        },
      });
      
      if (!existingItem) {
        res.status(404).json({
          error: {
            message: 'Inventory item not found',
            status: 404,
          },
        });
        return;
      }
      
      // Update item
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(quantity !== undefined && { quantity }),
          ...(expirationDate && { expirationDate: new Date(expirationDate) }),
        },
        include: {
          home: {
            select: { id: true, name: true }
          }
        }
      });
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to update inventory item',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/home/{homeId}/inventory/{id}:
 *   delete:
 *     summary: Delete inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Home ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID requesting the deletion
 *     responses:
 *       204:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
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
router.delete(
  '/:id',
  validateRequest({ params: homeInventoryParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const homeId = Number(req.params.homeId);
      const userId = Number(req.query.userId);
      
      if (!userId || isNaN(userId)) {
        res.status(400).json({
          error: {
            message: 'Valid user ID is required',
            status: 400,
          },
        });
        return;
      }

      if (!homeId || isNaN(homeId)) {
        res.status(400).json({
          error: {
            message: 'Valid home ID is required',
            status: 400,
          },
        });
        return;
      }

      // Verify user has access to this home
      const hasAccess = await checkHomeAccess(userId, homeId);
      if (!hasAccess) {
        res.status(403).json({
          error: {
            message: 'Access denied to this home',
            status: 403,
          },
        });
        return;
      }
      
      // Check if item exists and belongs to the specified home
      const existingItem = await prisma.inventoryItem.findFirst({
        where: { 
          id: Number(id),
          homeId: homeId
        },
      });
      
      if (!existingItem) {
        res.status(404).json({
          error: {
            message: 'Inventory item not found',
            status: 404,
          },
        });
        return;
      }
      
      await prisma.inventoryItem.delete({
        where: { id: Number(id) },
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to delete inventory item',
          status: 500,
        },
      });
    }
  }
);

export default router;
