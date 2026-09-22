import { z } from 'zod';

export const bookingIdParamsSchema = z.object({
  bookingId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const bookingListQuerySchema = z.object({
  lastBookingId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});
