import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { requireRole } from '../../../middleware/roleMiddleware';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  createCoachProfileController,
  getCoachProfileController,
  getCoachProfilesController,
  updateCoachProfileController,
} from '../controller/coachProfileController';
import {
  cancelCoachSlotController,
  createCoachSlotController,
  getCoachSlotsController,
  getPublicCoachSlotsController,
  streamCoachSlotController,
} from '../controller/coachSlotController';
import {
  coachProfileRequestSchema,
  coachSlotRequestSchema,
  coachDateQuerySchema,
  coachIdParamsSchema,
  coachListQuerySchema,
  coachSlotsQuerySchema,
  slotIdParamsSchema,
} from '../schema/coachRequestSchema';

const coachRouter: Router = Router();

coachRouter.post(
  '/v1/coach/profile',
  authMiddleware,
  requireRole('coach'),
  validate(coachProfileRequestSchema),
  createCoachProfileController,
);

coachRouter.patch(
  '/v1/coach/profile',
  authMiddleware,
  requireRole('coach'),
  validate(coachProfileRequestSchema.partial()),
  updateCoachProfileController,
);

coachRouter.get(
  '/v1/coaches',
  validateQuery(coachListQuerySchema),
  getCoachProfilesController,
);
coachRouter.get(
  '/v1/coaches/:coachId',
  validateParams(coachIdParamsSchema),
  getCoachProfileController,
);

coachRouter.post(
  '/v1/coach/slots',
  authMiddleware,
  requireRole('coach'),
  validate(coachSlotRequestSchema),
  createCoachSlotController,
);

coachRouter.get(
  '/v1/coach/slots',
  authMiddleware,
  requireRole('coach'),
  validateQuery(coachSlotsQuerySchema),
  getCoachSlotsController,
);

coachRouter.delete(
  '/v1/coach/slots/:slotId',
  authMiddleware,
  requireRole('coach'),
  validateParams(slotIdParamsSchema),
  cancelCoachSlotController,
);

coachRouter.get(
  '/v1/coaches/:coachId/slots',
  validateParams(coachIdParamsSchema),
  validateQuery(coachDateQuerySchema),
  getPublicCoachSlotsController,
);

coachRouter.get(
  '/v1/coaches/:coachId/slots/events',
  validateParams(coachIdParamsSchema),
  validateQuery(coachDateQuerySchema),
  streamCoachSlotController,
);

export default coachRouter;
