import { Router, Request, Response } from 'express';
import { validateRequest } from '../../middleware/validation';
import { 
  createRecommendedInventoryItemSchema, 
  updateRecommendedInventoryItemSchema, 
  recommendedInventoryItemParamsSchema 
} from '../../schemas/recommendedInventoryItem';
import { prisma } from '../../lib/prisma';

const router: Router = Router();

/**
 * @swagger
 * /api/admin/recommended-inventory:
 *   get:
 *     summary: Get all recommended inventory items
 *     tags: [Admin - Recommended Inventory]
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
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.recommendedInventoryItem.findMany({
      orderBy: { createdAt: 'desc' },
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
 * /api/admin/recommended-inventory/{id}:
 *   get:
 *     summary: Get recommended inventory item by ID
 *     tags: [Admin - Recommended Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recommended inventory item ID
 *     responses:
 *       200:
 *         description: Recommended inventory item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendedInventoryItem'
 *       404:
 *         description: Recommended inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validateRequest({ params: recommendedInventoryItemParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await prisma.recommendedInventoryItem.findUnique({
        where: { id: Number(id) },
      });
      
      if (!item) {
        res.status(404).json({
          error: {
            message: 'Recommended inventory item not found',
            status: 404,
          },
        });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to fetch recommended inventory item',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/recommended-inventory:
 *   post:
 *     summary: Create a new recommended inventory item
 *     tags: [Admin - Recommended Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - expiresIn
 *               - quantity
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *                 maxLength: 255
 *               expiresIn:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of days until expiration
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Recommended quantity
 *               isOptional:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this item is optional for preppers
 *               description:
 *                 type: string
 *                 description: Item description
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Recommended inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendedInventoryItem'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validateRequest({ body: createRecommendedInventoryItemSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, expiresIn, quantity, isOptional, description } = req.body;
      
      const newItem = await prisma.recommendedInventoryItem.create({
        data: {
          name,
          expiresIn,
          quantity,
          isOptional: isOptional ?? false,
          description,
        },
      });
      
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to create recommended inventory item',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/recommended-inventory/{id}:
 *   put:
 *     summary: Update recommended inventory item by ID
 *     tags: [Admin - Recommended Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recommended inventory item ID
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
 *                 maxLength: 255
 *               expiresIn:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of days until expiration
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Recommended quantity
 *               isOptional:
 *                 type: boolean
 *                 description: Whether this item is optional for preppers
 *               description:
 *                 type: string
 *                 description: Item description
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Recommended inventory item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendedInventoryItem'
 *       404:
 *         description: Recommended inventory item not found
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
  validateRequest({ params: recommendedInventoryItemParamsSchema, body: updateRecommendedInventoryItemSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, expiresIn, quantity, isOptional, description } = req.body;
      
      // Check if item exists
      const existingItem = await prisma.recommendedInventoryItem.findUnique({
        where: { id: Number(id) },
      });
      
      if (!existingItem) {
        res.status(404).json({
          error: {
            message: 'Recommended inventory item not found',
            status: 404,
          },
        });
        return;
      }
      
      // Update item
      const updatedItem = await prisma.recommendedInventoryItem.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(expiresIn !== undefined && { expiresIn }),
          ...(quantity !== undefined && { quantity }),
          ...(isOptional !== undefined && { isOptional }),
          ...(description && { description }),
        },
      });
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to update recommended inventory item',
          status: 500,
        },
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/recommended-inventory/{id}:
 *   delete:
 *     summary: Delete recommended inventory item by ID
 *     tags: [Admin - Recommended Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recommended inventory item ID
 *     responses:
 *       204:
 *         description: Recommended inventory item deleted successfully
 *       404:
 *         description: Recommended inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  validateRequest({ params: recommendedInventoryItemParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if item exists
      const existingItem = await prisma.recommendedInventoryItem.findUnique({
        where: { id: Number(id) },
      });
      
      if (!existingItem) {
        res.status(404).json({
          error: {
            message: 'Recommended inventory item not found',
            status: 404,
          },
        });
        return;
      }
      
      await prisma.recommendedInventoryItem.delete({
        where: { id: Number(id) },
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to delete recommended inventory item',
          status: 500,
        },
      });
    }
  }
);

export default router;
