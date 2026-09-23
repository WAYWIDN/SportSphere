import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Booking } from '../../booking/model/bookingModel';
import { queueBookingNotification } from '../../booking/utils/bookingNotificationQueue';
import { CoachSlot } from '../model/coachSlotModel';
import { SessionRequest } from '../model/sessionRequestModel';
import { sendSlotEvent } from '../utils/slotEventUtils';

const PAGE_SIZE = 10;

const getPage = <T extends { _id: Types.ObjectId }>(items: T[]) => {
  const hasNext = items.length > PAGE_SIZE;
  const data = items.slice(0, PAGE_SIZE);

  return {
    data,
    hasNext,
    lastId: hasNext ? data[data.length - 1]._id : null,
  };
};

export const createSessionRequestController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userMetadata?.id;
  const slotId = req.params.slotId as string;

  try {
    const slot = await CoachSlot.findOne({ _id: slotId, status: 'available' });
    if (!slot) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot is no longer available' });
    }

    const existingRequest = await SessionRequest.exists({ userId, slotId });
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You have already requested this slot',
      });
    }

    const hasOverlappingBooking = await Booking.exists({
      userId,
      status: 'confirmed',
      startEpoch: { $lt: slot.endEpoch },
      endEpoch: { $gt: slot.startEpoch },
    });
    if (hasOverlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have a booking at this time',
      });
    }

    const sessionRequest = await SessionRequest.create({
      userId,
      coachId: slot.coachId,
      slotId,
    });

    return res.status(201).json({ success: true, data: sessionRequest });
  } catch (error: any) {
    console.error('Error creating session request:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create session request' });
  }
};

export const getUserSessionRequestsController = async (
  req: Request,
  res: Response,
) => {
  const lastRequestId = req.query.lastRequestId as string | undefined;

  try {
    const requests = await SessionRequest.find(
      lastRequestId
        ? {
            userId: req.userMetadata?.id,
            _id: { $lt: new Types.ObjectId(lastRequestId) },
          }
        : { userId: req.userMetadata?.id },
    )
      .sort({ _id: -1 })
      .limit(11)
      .populate('coachId', 'email')
      .populate('slotId')
      .lean();
    const page = getPage(requests);

    return res.status(200).json({
      success: true,
      data: page.data,
      pagination: {
        limit: PAGE_SIZE,
        lastRequestId: page.lastId,
        hasNext: page.hasNext,
      },
    });
  } catch (error) {
    console.error('Error retrieving user session requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session requests',
    });
  }
};

export const getCoachSessionRequestsController = async (
  req: Request,
  res: Response,
) => {
  const lastRequestId = req.query.lastRequestId as string | undefined;

  try {
    const requests = await SessionRequest.find(
      lastRequestId
        ? {
            coachId: req.userMetadata?.id,
            _id: { $lt: new Types.ObjectId(lastRequestId) },
          }
        : { coachId: req.userMetadata?.id },
    )
      .sort({ _id: -1 })
      .limit(11)
      .populate('userId', 'email')
      .populate('slotId')
      .lean();
    const page = getPage(requests);

    return res.status(200).json({
      success: true,
      data: page.data,
      pagination: {
        limit: PAGE_SIZE,
        lastRequestId: page.lastId,
        hasNext: page.hasNext,
      },
    });
  } catch (error) {
    console.error('Error retrieving coach session requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session requests',
    });
  }
};

export const updateSessionRequestController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.userMetadata?.id;
  const requestId = req.params.requestId as string;
  const status = req.body.status as 'approved' | 'rejected';

  try {
    const sessionRequest = await SessionRequest.findOne({
      _id: requestId,
      coachId,
      status: 'pending',
    });
    if (!sessionRequest) {
      return res.status(409).json({
        success: false,
        message: 'Request was not found or has already been processed',
      });
    }

    if (status === 'rejected') {
      const slot = await CoachSlot.findById(sessionRequest.slotId).lean();
      sessionRequest.status = 'rejected';
      sessionRequest.updatedAt = new Date();
      await sessionRequest.save();
      await queueBookingNotification({
        requestId: sessionRequest._id.toString(),
        requestType: 'coach',
        status: 'rejected',
      });
      if (slot) {
        sendSlotEvent(
          slot.coachId.toString(),
          slot.date,
          slot._id.toString(),
          'slot_request_rejected',
          { requestId: sessionRequest._id },
        );
      }
      return res.status(200).json({ success: true, data: sessionRequest });
    }

    const slot = await CoachSlot.findOne({
      _id: sessionRequest.slotId,
      status: 'available',
    });
    if (!slot) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot is no longer available' });
    }

    const hasOverlappingBooking = await Booking.exists({
      userId: sessionRequest.userId,
      status: 'confirmed',
      startEpoch: { $lt: slot.endEpoch },
      endEpoch: { $gt: slot.startEpoch },
    });
    if (hasOverlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'User already has a booking at this time',
      });
    }

    const bookedSlot = await CoachSlot.findOneAndUpdate(
      { _id: slot._id, status: 'available' },
      { status: 'booked', updatedAt: new Date() },
      { new: true },
    );
    if (!bookedSlot) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot is no longer available' });
    }

    const booking = await Booking.create({
      userId: sessionRequest.userId,
      providerId: sessionRequest.coachId,
      providerType: 'coach',
      resourceId: bookedSlot._id,
      sourceRequestId: sessionRequest._id,
      startEpoch: bookedSlot.startEpoch,
      endEpoch: bookedSlot.endEpoch,
    });

    await queueBookingNotification({
      bookingId: booking._id.toString(),
      status: 'confirmed',
    });

    sessionRequest.status = 'approved';
    sessionRequest.updatedAt = new Date();
    await sessionRequest.save();

    const otherPendingRequests = await SessionRequest.find({
      slotId: bookedSlot._id,
      status: 'pending',
      _id: { $ne: sessionRequest._id },
    }).select('_id');
    await SessionRequest.updateMany(
      {
        slotId: bookedSlot._id,
        status: 'pending',
        _id: { $ne: sessionRequest._id },
      },
      { status: 'rejected', updatedAt: new Date() },
    );
    await Promise.all(
      otherPendingRequests.map((request) =>
        queueBookingNotification({
          requestId: request._id.toString(),
          requestType: 'coach',
          status: 'rejected',
        }),
      ),
    );

    sendSlotEvent(
      bookedSlot.coachId.toString(),
      bookedSlot.date,
      bookedSlot._id.toString(),
      'slot_booked',
      { slotId: bookedSlot._id, requestId: sessionRequest._id },
    );

    return res.status(200).json({
      success: true,
      data: { request: sessionRequest, booking },
    });
  } catch (error: any) {
    console.error('Error updating session request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update session request',
    });
  }
};
