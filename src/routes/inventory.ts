import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { createInventoryItemSchema, updateInventoryItemSchema, inventoryItemParamsSchema } from '../schemas/inventoryItem';
import { prisma } from '../lib/prisma';

const router: Router = Router();

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
 * /api/inventory:
 *   get:
 *     summary: Get inventory items for homes the user has access to
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to get inventory for
 *       - in: query
 *         name: homeId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional home ID to filter by specific home
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryItem'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    const homeId = req.query.homeId ? Number(req.query.homeId) : undefined;
    
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        error: {
          message: 'Valid user ID is required',
          status: 400,
        },
      });
      return;
    }

    // Build where clause based on user's accessible homes
    const whereClause: any = {
      home: {
        OR: [
          { ownerId: userId },
          {
            homeAccesses: {
              some: { userId }
            }
          }
        ]
      }
    };

    // If specific home is requested, add that filter
    if (homeId) {
      whereClause.homeId = homeId;
      
      // Verify user has access to this specific home
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
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
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
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     parameters:
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
  validateRequest({ params: inventoryItemParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
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

      const item = await prisma.inventoryItem.findFirst({
        where: {
          id: Number(id),
          home: {
            OR: [
              { ownerId: userId },
              {
                homeAccesses: {
                  some: { userId }
                }
              }
            ]
          }
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
            message: 'Inventory item not found or access denied',
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
 * /api/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
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
 *               - homeId
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
 *               homeId:
 *                type: integer
 *                minimum: 1
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
 */
router.post(
  '/',
  validateRequest({ body: createInventoryItemSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, quantity, expirationDate, homeId } = req.body;
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
 * /api/inventory/{id}:
 *   put:
 *     summary: Update inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
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
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  validateRequest({ params: inventoryItemParamsSchema, body: updateInventoryItemSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, quantity, expirationDate } = req.body;
      
      // Check if item exists
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { id: Number(id) },
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
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       204:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  validateRequest({ params: inventoryItemParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if item exists
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { id: Number(id) },
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
