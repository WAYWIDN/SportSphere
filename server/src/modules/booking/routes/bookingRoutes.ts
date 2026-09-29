import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { requireRole } from '../../../middleware/roleMiddleware';
import { validateQuery } from '../../../middleware/zodSchemaValidatorMiddleware';
import { bookingHistoryQuerySchema } from '../schema/bookingRequestSchema';
import { getBookingsController } from '../controller/bookingController';

const bookingRouter: Router = Router();

bookingRouter.get(
  '/v1/user/bookings',
  authMiddleware,
  requireRole('player'),
  validateQuery(bookingHistoryQuerySchema),
  getBookingsController,
);

export default bookingRouter;
