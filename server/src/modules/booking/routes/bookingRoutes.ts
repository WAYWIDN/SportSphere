import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import {
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  bookingIdParamsSchema,
  bookingListQuerySchema,
} from '../schema/bookingRequestSchema';
import {
  cancelBookingController,
  getBookingController,
  getUserBookingsController,
} from '../controller/bookingController';

const bookingRouter: Router = Router();

bookingRouter.get(
  '/v1/user/bookings',
  authMiddleware,
  validateQuery(bookingListQuerySchema),
  getUserBookingsController,
);

bookingRouter.get(
  '/v1/bookings/:bookingId',
  authMiddleware,
  validateParams(bookingIdParamsSchema),
  getBookingController,
);

bookingRouter.patch(
  '/v1/bookings/:bookingId/cancel',
  authMiddleware,
  validateParams(bookingIdParamsSchema),
  cancelBookingController,
);

export default bookingRouter;
