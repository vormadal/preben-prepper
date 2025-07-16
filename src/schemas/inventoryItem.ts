import { z } from 'zod';

// Validation schemas
export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
  expirationDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date format'),
  homeId: z.number().int().min(1, 'Home ID is required'),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  quantity: z.number().int().min(0, 'Quantity must be a non-negative integer').optional(),
  expirationDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date format').optional(),
  homeId: z.number().int().min(1, 'Home ID is required').optional(),
});

export const inventoryItemParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export type CreateInventoryItemRequest = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemRequest = z.infer<typeof updateInventoryItemSchema>;
export type InventoryItemParams = z.infer<typeof inventoryItemParamsSchema>;
