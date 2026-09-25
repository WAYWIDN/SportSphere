import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((date) => {
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === date
    );
  }, 'Date is invalid');

export const createGameRequestSchema = z
  .object({
    subvenueId: objectIdSchema,
    slotId: objectIdSchema,
    minimumPlayers: z.number().int().min(1),
    maximumPlayers: z.number().int().min(1),
  })
  .superRefine((game, context) => {
    if (game.maximumPlayers < game.minimumPlayers) {
      context.addIssue({
        code: 'custom',
        path: ['maximumPlayers'],
        message:
          'Maximum players must be greater than or equal to minimum players',
      });
    }
  });

export const gameListQuerySchema = z.object({
  subvenueId: objectIdSchema.optional(),
  date: dateSchema.optional(),
  lastGameId: objectIdSchema.optional(),
  sport: z.string().min(1).optional(),
  status: z.enum(['forming', 'ready']).optional(),
});

export const gameSearchBodySchema = z.object({
  subvenueId: objectIdSchema.optional(),
  sport: z.string().min(1).optional(),
  date: dateSchema.optional(),
  status: z.enum(['forming', 'ready']).optional(),
  minPlayers: z.number().int().min(1).optional(),
  maxPlayers: z.number().int().min(1).optional(),
  lastGameId: objectIdSchema.optional(),
});

export const gameIdParamsSchema = z.object({ gameId: objectIdSchema });

export const gameJoinRequestParamsSchema = z.object({
  gameId: objectIdSchema,
  requestId: objectIdSchema,
});

export const gameJoinRequestStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});
