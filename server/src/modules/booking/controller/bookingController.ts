import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CoachSlot } from '../../coach/model/coachSlotModel';
import { SessionRequest } from '../../coach/model/sessionRequestModel';
import { sendSlotEvent } from '../../coach/utils/slotEventUtils';
import { Booking } from '../model/bookingModel';

export const getUserBookingsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const lastBookingId = req.query.lastBookingId as string | undefined;

    const bookings = await Booking.find(
      lastBookingId
        ? {
            userId: req.userMetadata?.id,
            _id: { $lt: new Types.ObjectId(lastBookingId) },
          }
        : { userId: req.userMetadata?.id },
    )
      .sort({ _id: -1 })
      .limit(11)
      .lean();

    const hasNext = bookings.length > 10;
    const page = bookings.slice(0, 10);

    return res.status(200).json({
      success: true,
      data: page,
      pagination: {
        limit: 10,
        lastBookingId: hasNext ? page[page.length - 1]._id : null,
        hasNext,
      },
    });
  } catch (error) {
    console.error('Error retrieving user bookings:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve bookings' });
  }
};

export const getBookingController = async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId as string;
  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.userMetadata?.id,
    }).lean();
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error retrieving booking:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve booking' });
  }
};

export const cancelBookingController = async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId as string;
  try {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        userId: req.userMetadata?.id,
        status: 'confirmed',
      },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true },
    );
    if (!booking) {
      return res.status(409).json({
        success: false,
        message: 'Booking was not found or is already cancelled',
      });
    }

    if (booking.providerType === 'coach') {
      const slot = await CoachSlot.findOneAndUpdate(
        { _id: booking.resourceId, status: 'booked' },
        { status: 'available', updatedAt: new Date() },
        { new: true },
      );
      await SessionRequest.findByIdAndUpdate(booking.sourceRequestId, {
        status: 'cancelled',
        updatedAt: new Date(),
      });
      if (slot) {
        sendSlotEvent(
          slot.coachId.toString(),
          slot.date,
          slot._id.toString(),
          'slot_available',
          { slotId: slot._id },
        );
      }
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to cancel booking' });
  }
};
