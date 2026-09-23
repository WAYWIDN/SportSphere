import { z } from 'zod';
import { MINIMUM_SLOT_DURATION_MS } from '../../../utils/timeConstants';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((date) => {
    const parsedDate = new Date(date);
    return (
      !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === date
    );
  }, 'Date is invalid');

const locationSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  pincode: z.string().min(1),
});

export const venueRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: locationSchema,
  sports: z.array(z.string().min(1)).min(1),
  facilities: z.array(z.string().min(1)).default([]),
  images: z.array(z.url()).default([]),
});

export const subvenueRequestSchema = z.object({
  name: z.string().min(1),
  sport: z.string().min(1),
  description: z.string().min(1),
  images: z.array(z.url()).default([]),
});

const slotTimeSchema = z.object({
  date: dateSchema,
  startEpoch: z.number().int().positive(),
  endEpoch: z.number().int().positive(),
  price: z.number().finite().min(0),
});

export const slotRequestSchema = slotTimeSchema.superRefine((slot, context) => {
  if (slot.endEpoch <= slot.startEpoch) {
    context.addIssue({
      code: 'custom',
      path: ['endEpoch'],
      message: 'End time must be after start time',
    });
  }

  if (slot.endEpoch - slot.startEpoch < MINIMUM_SLOT_DURATION_MS) {
    context.addIssue({
      code: 'custom',
      path: ['endEpoch'],
      message: 'A slot must be at least 30 minutes long',
    });
  }
});

export const venueIdParamsSchema = z.object({ venueId: objectIdSchema });

export const venueListQuerySchema = z.object({
  lastVenueId: objectIdSchema.optional(),
});

export const subvenueIdParamsSchema = z.object({
  subvenueId: objectIdSchema,
});

export const venueSlotParamsSchema = z.object({
  subvenueId: objectIdSchema,
  slotId: objectIdSchema,
});

export const slotIdParamsSchema = z.object({ slotId: objectIdSchema });

export const venueBookingRequestIdParamsSchema = z.object({
  requestId: objectIdSchema,
});

export const venueBookingRequestStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const venueBookingRequestListQuerySchema = z.object({
  lastRequestId: objectIdSchema.optional(),
});

export const venueDateQuerySchema = z.object({ date: dateSchema });
