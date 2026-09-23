import { Request, Response } from 'express';
import { Subvenue } from '../model/subvenueModel';
import { VenueSlot } from '../model/slotModel';
import { addSlotClient, sendSlotEvent } from '../utils/slotEventUtils';
import { findOwnedSubvenue } from '../utils/venueOwnershipUtils';
import { hasSlotOverlap } from '../utils/venueSlotUtils';

export const createSlotController = async (req: Request, res: Response) => {
  const subvenueId = req.params.subvenueId as string;
  const { date, startEpoch, endEpoch, price } = req.body;

  try {
    const subvenue = await findOwnedSubvenue(
      subvenueId,
      req.userMetadata?.id as string,
    );
    if (!subvenue) {
      return res
        .status(404)
        .json({ success: false, message: 'Subvenue not found' });
    }

    if (await hasSlotOverlap(subvenueId, date, startEpoch, endEpoch)) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot overlaps an existing slot' });
    }

    const slot = await VenueSlot.create({
      subvenueId: subvenue._id,
      date,
      startEpoch,
      endEpoch,
      price,
    });
    sendSlotEvent(subvenueId, date, slot._id.toString(), 'slot-created', {
      slot,
    });
    return res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: slot,
    });
  } catch (error) {
    console.error('Error creating venue slot:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create slot' });
  }
};

export const getSlotsController = async (req: Request, res: Response) => {
  const subvenueId = req.params.subvenueId as string;
  const date = req.query.date as string;

  try {
    const slots = await VenueSlot.find({
      subvenueId,
      date,
    })
      .sort({ startEpoch: 1 })
      .lean();
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Error retrieving venue slots:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve slots' });
  }
};

export const deleteSlotController = async (req: Request, res: Response) => {
  try {
    const slot = await VenueSlot.findById(req.params.slotId);
    if (!slot) {
      return res
        .status(404)
        .json({ success: false, message: 'Slot not found' });
    }

    const subvenue = await findOwnedSubvenue(
      slot.subvenueId.toString(),
      req.userMetadata?.id as string,
    );
    if (!subvenue) {
      return res
        .status(404)
        .json({ success: false, message: 'Slot not found' });
    }

    await slot.deleteOne();
    sendSlotEvent(
      slot.subvenueId.toString(),
      slot.date,
      slot._id.toString(),
      'slot-deleted',
      {},
    );
    return res
      .status(200)
      .json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue slot:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete slot' });
  }
};

export const streamSlotController = async (req: Request, res: Response) => {
  const subvenueId = req.params.subvenueId as string;
  const date = req.query.date as string;

  try {
    const subvenue = await Subvenue.findById(subvenueId).populate('venueId');
    if (!subvenue || !subvenue.venueId) {
      return res
        .status(404)
        .json({ success: false, message: 'Subvenue not found' });
    }

    const slots = await VenueSlot.find({ subvenueId, date })
      .sort({ startEpoch: 1 })
      .lean();

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`event: slots-state\ndata: ${JSON.stringify({ slots })}\n\n`);

    const removeClient = addSlotClient(subvenueId, date, res);
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);
    req.on('close', () => {
      clearInterval(heartbeat);
      removeClient();
    });
  } catch (error) {
    console.error('Error opening venue slot stream:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to open slot stream' });
  }
};
