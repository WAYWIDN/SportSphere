import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { SessionRequest } from '../../coach/model/sessionRequestModel';
import { VenueBookingRequest } from '../../venue-owner/model/venueBookingRequestModel';
import {
  loadPublicUsers,
  toPublicUser,
} from '../../profile-management/utils/userNameUtils';

const PAGE_SIZE = 10;
const OPEN_REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

export const getBookingsController = async (
  req: Request,
  res: Response,
) => {
  const type = req.query.type as 'coach' | 'venue';
  const lastRequestId = req.query.lastRequestId as string | undefined;
  const filter: Record<string, unknown> = {
    userId: req.userMetadata?.id,
    status: { $in: OPEN_REQUEST_STATUSES },
  };

  if (lastRequestId) {
    filter._id = { $lt: new Types.ObjectId(lastRequestId) };
  }

  try {
    if (type === 'coach') {
      const requests = await SessionRequest.find(filter)
        .sort({ _id: -1 })
        .limit(PAGE_SIZE + 1)
        .populate('slotId')
        .lean();
      const hasNext = requests.length > PAGE_SIZE;
      const page = requests.slice(0, PAGE_SIZE);
      const users = await loadPublicUsers(
        page.flatMap((request) => [request.userId, request.coachId]),
      );
      const data = page.map((request) => ({
        ...request,
        userId: toPublicUser(request.userId, users),
        coachId: toPublicUser(request.coachId, users),
      }));

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          limit: PAGE_SIZE,
          lastRequestId: hasNext ? data[data.length - 1]._id : null,
          hasNext,
        },
      });
    }

    const requests = await VenueBookingRequest.find(filter)
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .populate({
        path: 'subvenueId',
        select: 'name sport venueId',
        populate: { path: 'venueId', select: 'name' },
      })
      .populate('slotId', 'date startEpoch endEpoch price')
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
    console.error('Error retrieving bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
    });
  }
};
