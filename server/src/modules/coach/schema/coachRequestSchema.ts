import { z } from 'zod';

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
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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

    if (slot.endEpoch - slot.startEpoch < 30 * 60 * 1000) {
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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const coachSlotsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
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
