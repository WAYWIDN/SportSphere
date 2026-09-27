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
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  pincode: z.string().min(1).max(20),
});

export const venueRequestSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  location: locationSchema,
  sports: z.array(z.string().min(1)).min(1),
  facilities: z.array(z.string().min(1)).default([]),
  images: z.array(z.string()).default([]),
});

export const subvenueRequestSchema = z.object({
  name: z.string().min(1).max(50),
  sport: z.string().min(1),
  description: z.string().min(1).max(500),
  images: z.array(z.string()).default([]),
});

const slotTimeSchema = z.object({
  date: dateSchema,
  startEpoch: z.number().int().positive(),
  endEpoch: z.number().int().positive(),
  price: z.number().finite().min(0),
});

export const slotRequestSchema = slotTimeSchema.superRefine((slot, context) => {
  if (slot.startEpoch <= Date.now()) {
    context.addIssue({
      code: 'custom',
      path: ['startEpoch'],
      message: 'Slot cannot be in the past',
    });
  }

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
  name: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  sport: z.string().min(1).optional(),
});

export const venueSearchBodySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  sport: z.string().min(1).max(100).optional(),
  facility: z.string().min(1).max(100).optional(),
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
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
});

export const venueDateQuerySchema = z.object({ date: dateSchema });
