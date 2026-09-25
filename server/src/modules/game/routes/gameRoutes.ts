import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { requireRole } from '../../../middleware/roleMiddleware';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  bookGameController,
  cancelGameController,
  createGameController,
  createJoinRequestController,
  getGameController,
  searchGamesController,
  getJoinRequestsController,
  streamGameController,
  updateJoinRequestController,
} from '../controller/gameController';
import {
  createGameRequestSchema,
  gameIdParamsSchema,
  gameJoinRequestParamsSchema,
  gameJoinRequestStatusSchema,
  gameSearchBodySchema,
} from '../schema/gameRequestSchema';

const gameRouter: Router = Router();

gameRouter.post(
  '/v1/games/search',
  validate(gameSearchBodySchema),
  searchGamesController,
);

gameRouter.get(
  '/v1/games/:gameId',
  validateParams(gameIdParamsSchema),
  getGameController,
);

gameRouter.get(
  '/v1/games/:gameId/stream',
  authMiddleware,
  requireRole('player'),
  validateParams(gameIdParamsSchema),
  streamGameController,
);

gameRouter.post(
  '/v1/games',
  authMiddleware,
  requireRole('player'),
  validate(createGameRequestSchema),
  createGameController,
);

gameRouter.post(
  '/v1/games/:gameId/join-request',
  authMiddleware,
  requireRole('player'),
  validateParams(gameIdParamsSchema),
  createJoinRequestController,
);

gameRouter.get(
  '/v1/games/:gameId/join-requests',
  authMiddleware,
  requireRole('player'),
  validateParams(gameIdParamsSchema),
  getJoinRequestsController,
);

gameRouter.patch(
  '/v1/games/:gameId/join-requests/:requestId',
  authMiddleware,
  requireRole('player'),
  validateParams(gameJoinRequestParamsSchema),
  validate(gameJoinRequestStatusSchema),
  updateJoinRequestController,
);

gameRouter.post(
  '/v1/games/:gameId/book',
  authMiddleware,
  requireRole('player'),
  validateParams(gameIdParamsSchema),
  bookGameController,
);

gameRouter.post(
  '/v1/games/:gameId/cancel',
  authMiddleware,
  requireRole('player'),
  validateParams(gameIdParamsSchema),
  cancelGameController,
);

export default gameRouter;
