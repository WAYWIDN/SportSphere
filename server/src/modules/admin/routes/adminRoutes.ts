import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { adminMiddleware } from '../../../middleware/adminMiddleware';
import {
  getPendingApplicationsController,
  updateApplicationStatusController,
} from '../controller/adminApplicationController';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  applicationIdParamsSchema,
  applicationListQuerySchema,
  updateApplicationStatusSchema,
} from '../schema/adminRequestSchema';

const adminRouter: Router = Router();

adminRouter.get(
  '/v1/admin/applications',
  authMiddleware,
  adminMiddleware,
  validateQuery(applicationListQuerySchema),
  getPendingApplicationsController,
);

adminRouter.patch(
  '/v1/admin/applications/:applicationId',
  authMiddleware,
  adminMiddleware,
  validateParams(applicationIdParamsSchema),
  validate(updateApplicationStatusSchema),
  updateApplicationStatusController,
);

export default adminRouter;
