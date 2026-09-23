import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleWare';
import { requireRole } from '../../../middleware/roleMiddleware';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware/zodSchemaValidatorMiddleware';
import {
  createSubvenueController,
  createVenueController,
  deleteSubvenueController,
  deleteVenueController,
  getSubvenueController,
  getSubvenuesController,
  getVenueController,
  getVenuesController,
  updateSubvenueController,
  updateVenueController,
} from '../controller/venueController';
import {
  createVenueBookingRequestController,
  getVenueBookingRequestsController,
  updateVenueBookingRequestController,
} from '../controller/venueBookingRequestController';
import {
  createSlotController,
  deleteSlotController,
  getSlotsController,
  streamSlotController,
} from '../controller/slotController';
import {
  slotIdParamsSchema,
  slotRequestSchema,
  subvenueIdParamsSchema,
  subvenueRequestSchema,
  venueDateQuerySchema,
  venueBookingRequestIdParamsSchema,
  venueBookingRequestListQuerySchema,
  venueBookingRequestStatusSchema,
  venueIdParamsSchema,
  venueListQuerySchema,
  venueRequestSchema,
  venueSlotParamsSchema,
} from '../schema/venueRequestSchema';

const venueOwnerRouter: Router = Router();
const venueOwnerAuth = [authMiddleware, requireRole('venue-owner')];

venueOwnerRouter.post(
  '/v1/venues',
  ...venueOwnerAuth,
  validate(venueRequestSchema),
  createVenueController,
);
venueOwnerRouter.get(
  '/v1/venues',
  ...venueOwnerAuth,
  validateQuery(venueListQuerySchema),
  getVenuesController,
);
venueOwnerRouter.get(
  '/v1/venues/:venueId',
  validateParams(venueIdParamsSchema),
  getVenueController,
);
venueOwnerRouter.patch(
  '/v1/venues/:venueId',
  ...venueOwnerAuth,
  validateParams(venueIdParamsSchema),
  validate(venueRequestSchema.partial()),
  updateVenueController,
);
venueOwnerRouter.delete(
  '/v1/venues/:venueId',
  ...venueOwnerAuth,
  validateParams(venueIdParamsSchema),
  deleteVenueController,
);

venueOwnerRouter.post(
  '/v1/venues/:venueId/subvenues',
  ...venueOwnerAuth,
  validateParams(venueIdParamsSchema),
  validate(subvenueRequestSchema),
  createSubvenueController,
);
venueOwnerRouter.get(
  '/v1/venues/:venueId/subvenues',
  validateParams(venueIdParamsSchema),
  getSubvenuesController,
);
venueOwnerRouter.get(
  '/v1/subvenues/:subvenueId',
  validateParams(subvenueIdParamsSchema),
  getSubvenueController,
);
venueOwnerRouter.patch(
  '/v1/subvenues/:subvenueId',
  ...venueOwnerAuth,
  validateParams(subvenueIdParamsSchema),
  validate(subvenueRequestSchema.partial()),
  updateSubvenueController,
);
venueOwnerRouter.delete(
  '/v1/subvenues/:subvenueId',
  ...venueOwnerAuth,
  validateParams(subvenueIdParamsSchema),
  deleteSubvenueController,
);

venueOwnerRouter.post(
  '/v1/subvenues/:subvenueId/slots',
  ...venueOwnerAuth,
  validateParams(subvenueIdParamsSchema),
  validate(slotRequestSchema),
  createSlotController,
);
venueOwnerRouter.get(
  '/v1/subvenues/:subvenueId/slots',
  validateParams(subvenueIdParamsSchema),
  validateQuery(venueDateQuerySchema),
  getSlotsController,
);
venueOwnerRouter.get(
  '/v1/subvenues/:subvenueId/slots/stream',
  validateParams(subvenueIdParamsSchema),
  validateQuery(venueDateQuerySchema),
  streamSlotController,
);
venueOwnerRouter.delete(
  '/v1/slots/:slotId',
  ...venueOwnerAuth,
  validateParams(slotIdParamsSchema),
  deleteSlotController,
);

venueOwnerRouter.post(
  '/v1/subvenues/:subvenueId/slots/:slotId/booking-requests',
  authMiddleware,
  requireRole('player'),
  validateParams(venueSlotParamsSchema),
  createVenueBookingRequestController,
);
venueOwnerRouter.get(
  '/v1/venue-owner/booking-requests',
  authMiddleware,
  requireRole('venue-owner'),
  validateQuery(venueBookingRequestListQuerySchema),
  getVenueBookingRequestsController,
);
venueOwnerRouter.patch(
  '/v1/venue-owner/booking-requests/:requestId',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(venueBookingRequestIdParamsSchema),
  validate(venueBookingRequestStatusSchema),
  updateVenueBookingRequestController,
);

export default venueOwnerRouter;
