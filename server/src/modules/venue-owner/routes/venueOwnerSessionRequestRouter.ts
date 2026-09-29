import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { requireRole } from '../../../middleware/roleMiddleware';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  createVenueBookingRequestController,
  getVenueBookingRequestsController,
  updateVenueBookingRequestController,
} from '../controller/venueBookingRequestController';

import {
  venueBookingRequestIdParamsSchema,
  venueBookingRequestListQuerySchema,
  venueBookingRequestStatusSchema,
  venueSlotParamsSchema,
} from '../schema/venueRequestSchema';

const venueOwnerSessionRequestRouter: Router = Router();

venueOwnerSessionRequestRouter.post(
  '/v1/subvenues/:subvenueId/slots/:slotId/booking-requests',
  authMiddleware,
  requireRole('player'),
  validateParams(venueSlotParamsSchema),
  createVenueBookingRequestController,
);
venueOwnerSessionRequestRouter.get(
  '/v1/venue-owner/booking-requests',
  authMiddleware,
  requireRole('venue-owner'),
  validateQuery(venueBookingRequestListQuerySchema),
  getVenueBookingRequestsController,
);
venueOwnerSessionRequestRouter.patch(
  '/v1/venue-owner/booking-requests/:requestId',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(venueBookingRequestIdParamsSchema),
  validate(venueBookingRequestStatusSchema),
  updateVenueBookingRequestController,
);

export default venueOwnerSessionRequestRouter;
