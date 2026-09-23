import { z } from 'zod';
import { MINIMUM_SLOT_DURATION_MS } from '../../../utils/timeConstants';

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

const coachingCenterSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
});

export const coachProfileRequestSchema = z.object({
  bio: z.string().min(1),
  experience: z.number().int().min(0),
  sports: z.array(z.string().min(1)).min(1),
  photos: z.array(z.url()).optional(),
  coachingCenter: coachingCenterSchema,
});

export const coachSlotRequestSchema = z
  .object({
    date: dateSchema,
    startEpoch: z.number().int().positive(),
    endEpoch: z.number().int().positive(),
  })
  .superRefine((slot, context) => {
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

export const coachIdParamsSchema = z.object({
  coachId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const slotIdParamsSchema = z.object({
  slotId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const coachDateQuerySchema = z.object({
  date: dateSchema,
});

export const coachSlotsQuerySchema = z.object({
  date: z.string().pipe(dateSchema).optional(),
});

export const coachListQuerySchema = z.object({
  lastCoachId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});

export const sessionRequestListQuerySchema = z.object({
  lastRequestId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});

export const sessionRequestStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const requestIdParamsSchema = z.object({
  requestId: z.string().regex(/^[a-f\d]{24}$/i),
});
