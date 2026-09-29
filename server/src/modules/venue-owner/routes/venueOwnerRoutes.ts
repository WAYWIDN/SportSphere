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
  getMyVenuesController,
  getSubvenueController,
  getSubvenuesController,
  getVenueController,
  searchVenuesController,
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
  venueSearchBodySchema,
  venueRequestSchema,
  venueSlotParamsSchema,
} from '../schema/venueRequestSchema';

const venueOwnerRouter: Router = Router();

venueOwnerRouter.post(
  '/v1/venues',
  authMiddleware,
  requireRole('venue-owner'),
  validate(venueRequestSchema),
  createVenueController,
);
venueOwnerRouter.get(
  '/v1/venue-owner/venues',
  authMiddleware,
  requireRole('venue-owner'),
  getMyVenuesController,
);
venueOwnerRouter.post(
  '/v1/venues/search',
  validate(venueSearchBodySchema),
  searchVenuesController,
);
venueOwnerRouter.get(
  '/v1/venues/:venueId',
  validateParams(venueIdParamsSchema),
  getVenueController,
);
venueOwnerRouter.patch(
  '/v1/venues/:venueId',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(venueIdParamsSchema),
  validate(venueRequestSchema.partial()),
  updateVenueController,
);
venueOwnerRouter.delete(
  '/v1/venues/:venueId',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(venueIdParamsSchema),
  deleteVenueController,
);

venueOwnerRouter.post(
  '/v1/venues/:venueId/subvenues',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(venueIdParamsSchema),
  validate(subvenueRequestSchema),
  createSubvenueController,
);
venueOwnerRouter.get(
  '/v1/venues/:venueId/subvenues',
  authMiddleware,
  requireRole('venue-owner'),
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
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(subvenueIdParamsSchema),
  validate(subvenueRequestSchema.partial()),
  updateSubvenueController,
);
venueOwnerRouter.delete(
  '/v1/subvenues/:subvenueId',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(subvenueIdParamsSchema),
  deleteSubvenueController,
);

venueOwnerRouter.post(
  '/v1/subvenues/:subvenueId/slots',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(subvenueIdParamsSchema),
  validate(slotRequestSchema),
  createSlotController,
);
venueOwnerRouter.get(
  '/v1/subvenues/:subvenueId/slots',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(subvenueIdParamsSchema),
  validateQuery(venueDateQuerySchema),
  getSlotsController,
);
venueOwnerRouter.get(
  '/v1/subvenues/:subvenueId/slots/stream',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(subvenueIdParamsSchema),
  validateQuery(venueDateQuerySchema),
  streamSlotController,
);

venueOwnerRouter.delete(
  '/v1/slots/:slotId',
  authMiddleware,
  requireRole('venue-owner'),
  validateParams(slotIdParamsSchema),
  deleteSlotController,
);


export default venueOwnerRouter;
