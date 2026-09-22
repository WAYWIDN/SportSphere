import { z } from 'zod';

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const applicationIdParamsSchema = z.object({
  applicationId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const applicationListQuerySchema = z.object({
  lastApplicationId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});
