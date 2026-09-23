import { Request, Response } from 'express';
import { CoachSlot } from '../model/coachSlotModel';
import { hasSlotOverlap } from '../utils/coachSlotUtils';
import { addSlotClient, sendSlotEvent } from '../utils/slotEventUtils';

export const createCoachSlotController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.userMetadata?.id as string;
  const { date, startEpoch, endEpoch } = req.body;

  try {
    if (await hasSlotOverlap(coachId as string, date, startEpoch, endEpoch)) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot overlaps an existing slot' });
    }

    const slot = await CoachSlot.create({
      coachId,
      date,
      startEpoch,
      endEpoch,
    });

    sendSlotEvent(
      slot.coachId.toString(),
      slot.date,
      slot._id.toString(),
      'slot_created',
      { slot },
    );
    return res.status(201).json({ success: true, data: slot });
  } catch (error) {
    console.error('Error creating coach slot:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create coach slot' });
  }
};

export const getCoachSlotsController = async (req: Request, res: Response) => {
  const coachId = req.userMetadata?.id as string;
  const date = req.query.date as string | undefined;

  try {
    const slots = await CoachSlot.find({
      coachId,
      ...(date ? { date } : {}),
    })
      .sort({ startEpoch: 1 })
      .lean();

    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Error retrieving coach slots:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve coach slots' });
  }
};

export const getPublicCoachSlotsController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.params.coachId as string;
  const date = req.query.date as string;

  try {
    const slots = await CoachSlot.find({
      coachId,
      date,
      status: 'available',
    })
      .sort({ startEpoch: 1 })
      .lean();

    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Error retrieving public coach slots:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve coach slots' });
  }
};

export const cancelCoachSlotController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.userMetadata?.id as string;
  const slotId = req.params.slotId as string;

  try {
    const slot = await CoachSlot.findOneAndUpdate(
      { _id: slotId, coachId, status: 'available' },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true },
    );
    if (!slot) {
      return res.status(409).json({
        success: false,
        message: 'Slot was not found or is no longer available',
      });
    }

    sendSlotEvent(
      slot.coachId.toString(),
      slot.date,
      slot._id.toString(),
      'slot_cancelled',
      { slotId: slot._id },
    );
    return res.status(200).json({ success: true, data: slot });
  } catch (error) {
    console.error('Error cancelling coach slot:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to cancel coach slot' });
  }
};

export const streamCoachSlotController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.params.coachId as string;
  const date = req.query.date as string;

  try {
    const slots = await CoachSlot.find({ coachId, date })
      .sort({ startEpoch: 1 })
      .lean();

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`event: slots_state\ndata: ${JSON.stringify({ slots })}\n\n`);

    const removeClient = addSlotClient(coachId, date, res);
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);
    req.on('close', () => {
      clearInterval(heartbeat);
      removeClient();
    });
  } catch (error) {
    console.error('Error opening coach slot stream:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to open slot stream' });
  }
};
