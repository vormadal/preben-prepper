import { z } from 'zod';

// Validation schemas
export const createHomeSchema = z.object({
  name: z.string().min(1, 'Home name is required'),
  numberOfAdults: z.number().int().min(1, 'Number of adults must be at least 1').default(2),
  numberOfChildren: z.number().int().min(0, 'Number of children cannot be negative').default(0),
  numberOfPets: z.number().int().min(0, 'Number of pets cannot be negative').default(0),
});

export const updateHomeSchema = z.object({
  name: z.string().min(1, 'Home name is required').optional(),
  numberOfAdults: z.number().int().min(1, 'Number of adults must be at least 1').optional(),
  numberOfChildren: z.number().int().min(0, 'Number of children cannot be negative').optional(),
  numberOfPets: z.number().int().min(0, 'Number of pets cannot be negative').optional(),
});

export const homeParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export const homeAccessSchema = z.object({
  userId: z.number().int().min(1, 'User ID is required'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const updateHomeAccessSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const homeAccessParamsSchema = z.object({
  homeId: z.string().regex(/^\d+$/, 'Home ID must be a number').transform(Number),
  userId: z.string().regex(/^\d+$/, 'User ID must be a number').transform(Number),
});

export type CreateHomeRequest = z.infer<typeof createHomeSchema>;
export type UpdateHomeRequest = z.infer<typeof updateHomeSchema>;
export type HomeParams = z.infer<typeof homeParamsSchema>;
export type HomeAccessRequest = z.infer<typeof homeAccessSchema>;
export type UpdateHomeAccessRequest = z.infer<typeof updateHomeAccessSchema>;
export type HomeAccessParams = z.infer<typeof homeAccessParamsSchema>;
