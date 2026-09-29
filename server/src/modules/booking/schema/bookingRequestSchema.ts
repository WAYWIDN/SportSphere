import { z } from 'zod';

export const bookingHistoryQuerySchema = z.object({
  type: z.enum(['coach', 'venue']),
  lastRequestId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});
