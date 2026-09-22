import { Router } from 'express';
import {
  authMeController,
  loginUserController,
  logoutUserController,
  registerUserController,
  resetPasswordController,
  sendOTPController,
  verifyOTPController,
} from '../controller/authController';
import {
  sendOTPRequestSchema,
  verifyOTPRequestSchema,
  registerUserRequestSchema,
  loginUserRequestSchema,
  resetPasswordRequestSchema,
} from '../schema/authRequestSchema';
import { validate } from '../../../middleware/zodSchemaValidatorMiddleware';
import { authMiddleware } from '../../../middleware/authMiddleWare';

const authRouter: Router = Router();

authRouter.post(
  '/v1/send-otp',
  validate(sendOTPRequestSchema),
  sendOTPController,
);

authRouter.post(
  '/v1/verify-otp',
  validate(verifyOTPRequestSchema),
  verifyOTPController,
);

authRouter.post(
  '/v1/reset-password/send-otp',
  authMiddleware,
  validate(sendOTPRequestSchema),
  sendOTPController,
);

authRouter.post(
  '/v1/reset-password/verify-otp',
  authMiddleware,
  validate(verifyOTPRequestSchema),
  verifyOTPController,
);

authRouter.post(
  '/v1/reset-password/change',
  authMiddleware,
  validate(resetPasswordRequestSchema),
  resetPasswordController,
);

authRouter.post(
  '/v1/forgot-password',
  validate(resetPasswordRequestSchema),
  resetPasswordController,
);

authRouter.post(
  '/v1/register',
  validate(registerUserRequestSchema),
  registerUserController,
);

authRouter.post(
  '/v1/login',
  validate(loginUserRequestSchema),
  loginUserController,
);

authRouter.get('/v1/auth-me', authMiddleware, authMeController);

authRouter.post('/v1/logout', authMiddleware, logoutUserController);

export default authRouter;
