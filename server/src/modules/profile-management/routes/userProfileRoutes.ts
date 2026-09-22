import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import {
  getUserProfileController,
  getUserProfileByIdController,
  updateUserProfileController,
  applyForCoachOrVenueOwnerController,
} from '../controller/userProfileController';
import {
  updateUserProfileRequestSchema,
  applicationDataSchema,
} from '../schema/userProfileRequestSchema';
import { validate } from '../../../middleware/zodSchemaValidatorMiddleware';

const userProfileRouter: Router = Router();

userProfileRouter.get(
  '/v1/user-profile',
  authMiddleware,
  getUserProfileController,
);

userProfileRouter.get(
  '/v1/user-profile/:userId',
  authMiddleware,
  getUserProfileByIdController,
);

userProfileRouter.post(
  '/v1/user-profile',
  authMiddleware,
  validate(updateUserProfileRequestSchema),
  updateUserProfileController,
);

userProfileRouter.post(
  '/v1/apply-coach-venue-owner',
  authMiddleware,
  validate(applicationDataSchema),
  applyForCoachOrVenueOwnerController,
);

export default userProfileRouter;
