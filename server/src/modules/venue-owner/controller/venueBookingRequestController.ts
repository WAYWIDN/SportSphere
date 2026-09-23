import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Booking } from '../../booking/model/bookingModel';
import { queueBookingNotification } from '../../booking/utils/bookingNotificationQueue';
import { Subvenue } from '../model/subvenueModel';
import { Venue } from '../model/venueModel';
import { VenueBookingRequest } from '../model/venueBookingRequestModel';
import { VenueSlot } from '../model/slotModel';
import { sendSlotEvent } from '../utils/slotEventUtils';

const PAGE_SIZE = 10;

export const createVenueBookingRequestController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userMetadata?.id;
  const subvenueId = req.params.subvenueId as string;
  const slotId = req.params.slotId as string;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const subvenue = await Subvenue.findById(subvenueId)
      .populate<{ venueId: { ownerId: Types.ObjectId } }>('venueId', 'ownerId')
      .lean();
    const venue = subvenue?.venueId;
    const slot = await VenueSlot.findOne({
      _id: slotId,
      subvenueId,
      status: 'available',
    }).lean();

    if (!venue || !slot) {
      return res.status(404).json({
        success: false,
        message: 'Subvenue or slot not found',
      });
    }
    if (slot.endEpoch <= Date.now()) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot has already ended' });
    }

    const existingRequest = await VenueBookingRequest.exists({
      userId,
      slotId,
    });
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You have already requested this slot',
      });
    }

    const existingBooking = await Booking.exists({
      userId,
      status: 'confirmed',
      startEpoch: { $lt: slot.endEpoch },
      endEpoch: { $gt: slot.startEpoch },
    });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have a booking at this time',
      });
    }

    const request = await VenueBookingRequest.create({
      userId,
      venueOwnerId: venue.ownerId,
      subvenueId,
      slotId,
    });
    return res.status(201).json({
      success: true,
      message: 'Venue booking request sent successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error creating venue booking request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create venue booking request',
    });
  }
};

export const getVenueBookingRequestsController = async (
  req: Request,
  res: Response,
) => {
  const lastRequestId = req.query.lastRequestId as string | undefined;

  try {
    const requests = await VenueBookingRequest.find({
      venueOwnerId: req.userMetadata?.id,
      ...(lastRequestId
        ? { _id: { $lt: new Types.ObjectId(lastRequestId) } }
        : {}),
    })
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .populate('userId', 'email')
      .populate('subvenueId')
      .populate('slotId')
      .lean();

    const hasNext = requests.length > PAGE_SIZE;
    const data = requests.slice(0, PAGE_SIZE);
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        limit: PAGE_SIZE,
        lastRequestId: hasNext ? data[data.length - 1]._id : null,
        hasNext,
      },
    });
  } catch (error) {
    console.error('Error retrieving venue booking requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve venue booking requests',
    });
  }
};

export const updateVenueBookingRequestController = async (
  req: Request,
  res: Response,
) => {
  const requestId = req.params.requestId as string;
  const status = req.body.status as 'approved' | 'rejected';

  try {
    const request = await VenueBookingRequest.findOne({
      _id: requestId,
      venueOwnerId: req.userMetadata?.id,
      status: 'pending',
    });
    if (!request) {
      return res.status(409).json({
        success: false,
        message: 'Request was not found or has already been processed',
      });
    }

    if (status === 'rejected') {
      const slot = await VenueSlot.findById(request.slotId).lean();
      request.status = 'rejected';
      request.respondedAt = new Date();
      request.updatedAt = new Date();
      await request.save();
      await queueBookingNotification({
        requestId: request._id.toString(),
        requestType: 'venue',
        status: 'rejected',
      });
      if (slot) {
        sendSlotEvent(
          slot.subvenueId.toString(),
          slot.date,
          slot._id.toString(),
          'slot_request_rejected',
          { requestId: request._id },
        );
      }
      return res.status(200).json({ success: true, data: request });
    }

    const slot = await VenueSlot.findOneAndUpdate(
      {
        _id: request.slotId,
        subvenueId: request.subvenueId,
        status: 'available',
        endEpoch: { $gt: Date.now() },
      },
      { status: 'booked', updatedAt: new Date() },
      { new: true },
    );
    if (!slot) {
      return res.status(409).json({
        success: false,
        message: 'Slot is no longer available',
      });
    }

    try {
      const booking = await Booking.create({
        userId: request.userId,
        providerId: request.venueOwnerId,
        providerType: 'venue',
        resourceId: slot._id,
        sourceVenueRequestId: request._id,
        startEpoch: slot.startEpoch,
        endEpoch: slot.endEpoch,
      });

      request.status = 'approved';
      request.respondedAt = new Date();
      request.updatedAt = new Date();
      await request.save();

      await queueBookingNotification({
        bookingId: booking._id.toString(),
        status: 'confirmed',
      });

      sendSlotEvent(
        slot.subvenueId.toString(),
        slot.date,
        slot._id.toString(),
        'slot_booked',
        { slotId: slot._id, requestId: request._id },
      );

      return res.status(200).json({
        success: true,
        data: { request, booking },
      });
    } catch (error) {
      await VenueSlot.findOneAndUpdate(
        { _id: slot._id, status: 'booked' },
        { status: 'available', updatedAt: new Date() },
      );
      throw error;
    }
  } catch (error) {
    console.error('Error updating venue booking request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update venue booking request',
    });
  }
};
