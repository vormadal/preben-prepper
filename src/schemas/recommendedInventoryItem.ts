import { z } from 'zod';

export const createRecommendedInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  expiresIn: z.number().int().min(1, 'Expires in must be at least 1 day'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  isOptional: z.boolean().optional().default(false),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
});

export const updateRecommendedInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').optional(),
  expiresIn: z.number().int().min(1, 'Expires in must be at least 1 day').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  isOptional: z.boolean().optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters').optional(),
});

export const recommendedInventoryItemParamsSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('ID must be a valid number');
    }
    return parsed;
  }),
});

export type CreateRecommendedInventoryItemRequest = z.infer<typeof createRecommendedInventoryItemSchema>;
export type UpdateRecommendedInventoryItemRequest = z.infer<typeof updateRecommendedInventoryItemSchema>;
export type RecommendedInventoryItemParams = z.infer<typeof recommendedInventoryItemParamsSchema>;
