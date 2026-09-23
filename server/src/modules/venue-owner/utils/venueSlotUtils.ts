import { VenueSlot } from '../model/slotModel';

export const hasSlotOverlap = async (
  subvenueId: string,
  date: string,
  startEpoch: number,
  endEpoch: number,
) =>
  VenueSlot.exists({
    subvenueId,
    date,
    status: { $in: ['available', 'booked'] },
    startEpoch: { $lt: endEpoch },
    endEpoch: { $gt: startEpoch },
  });