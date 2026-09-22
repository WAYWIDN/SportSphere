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
  getUserSessionRequestsController,
  updateSessionRequestController,
} from '../controller/sessionRequestController';
import {
  requestIdParamsSchema,
  sessionRequestListQuerySchema,
  sessionRequestStatusSchema,
  slotIdParamsSchema,
} from '../schema/coachRequestSchema';

const sessionRequestRouter: Router = Router();

sessionRequestRouter.post(
  '/v1/slots/:slotId/requests',
  authMiddleware,
  requireRole('player'),
  validateParams(slotIdParamsSchema),
  createSessionRequestController,
);

sessionRequestRouter.get(
  '/v1/user/session-requests',
  authMiddleware,
  requireRole('player'),
  validateQuery(sessionRequestListQuerySchema),
  getUserSessionRequestsController,
);

sessionRequestRouter.get(
  '/v1/coach/session-requests',
  authMiddleware,
  requireRole('coach'),
  validateQuery(sessionRequestListQuerySchema),
  getCoachSessionRequestsController,
);

sessionRequestRouter.patch(
  '/v1/coach/session-requests/:requestId',
  authMiddleware,
  requireRole('coach'),
  validateParams(requestIdParamsSchema),
  validate(sessionRequestStatusSchema),
  updateSessionRequestController,
);

export default sessionRequestRouter;
