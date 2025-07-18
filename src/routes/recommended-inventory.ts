import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router: Router = Router();

/**
 * @swagger
 * /api/recommended-inventory:
 *   get:
 *     summary: Get all recommended inventory items for users
 *     tags: [Recommended Inventory]
 *     parameters:
 *       - in: query
 *         name: includeOptional
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to include optional items
 *     responses:
 *       200:
 *         description: List of recommended inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecommendedInventoryItem'
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const includeOptional = req.query.includeOptional !== 'false';
    
    const whereClause = includeOptional ? {} : { isOptional: false };
    
    const items = await prisma.recommendedInventoryItem.findMany({
      where: whereClause,
      orderBy: [
        { isOptional: 'asc' }, // Non-optional items first
        { name: 'asc' }
      ],
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch recommended inventory items',
        status: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/recommended-inventory/{id}/create-inventory:
 *   post:
 *     summary: Create an inventory item from a recommended item
 *     tags: [Recommended Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recommended inventory item ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Override the recommended quantity
 *               customExpirationDate:
 *                 type: string
 *                 format: date
 *                 description: Use custom expiration date instead of calculated one
 *     responses:
 *       201:
 *         description: Inventory item created successfully from recommendation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Recommended inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/create-inventory', authenticateToken, async (req: Request, res: Response): Promise<void> => {
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
    const { quantity, customExpirationDate, homeId } = req.body || {};
    
    // Find the recommended item
    const recommendedItem = await prisma.recommendedInventoryItem.findUnique({
      where: { id: Number(id) },
    });
    
    if (!recommendedItem) {
      res.status(404).json({
        error: {
          message: 'Recommended inventory item not found',
          status: 404,
        },
      });
      return;
    }
    
    // Calculate expiration date
    let expirationDate: Date;
    if (customExpirationDate) {
      expirationDate = new Date(customExpirationDate);
    } else {
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + recommendedItem.expiresIn);
    }
    
    // Create the inventory item
    const newInventoryItem = await prisma.inventoryItem.create({
      data: {
        name: recommendedItem.name,
        quantity: quantity || recommendedItem.quantity,
        expirationDate,
        homeId: homeId,
      },
    });
    
    res.status(201).json(newInventoryItem);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to create inventory item from recommendation',
        status: 500,
      },
    });
  }
});

export default router;
