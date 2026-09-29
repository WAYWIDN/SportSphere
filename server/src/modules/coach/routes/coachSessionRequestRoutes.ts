import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { requireRole } from '../../../middleware/roleMiddleware';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  createSessionRequestController,
  getCoachSessionRequestsController,
  updateSessionRequestController,
} from '../controller/sessionRequestController';
import {
  requestIdParamsSchema,
  sessionRequestListQuerySchema,
  sessionRequestStatusSchema,
  slotIdParamsSchema,
} from '../schema/coachRequestSchema';

const coachSessionRequestRouter: Router = Router();

coachSessionRequestRouter.post(
  '/v1/slots/:slotId/requests',
  authMiddleware,
  requireRole('player'),
  validateParams(slotIdParamsSchema),
  createSessionRequestController,
);

coachSessionRequestRouter.get(
  '/v1/coach/session-requests',
  authMiddleware,
  requireRole('coach'),
  validateQuery(sessionRequestListQuerySchema),
  getCoachSessionRequestsController,
);

coachSessionRequestRouter.patch(
  '/v1/coach/session-requests/:requestId',
  authMiddleware,
  requireRole('coach'),
  validateParams(requestIdParamsSchema),
  validate(sessionRequestStatusSchema),
  updateSessionRequestController,
);

export default coachSessionRequestRouter;
