import { CoachSlot } from '../model/coachSlotModel';

export const MINIMUM_SLOT_DURATION = 30 * 60 * 1000;

export const hasSlotOverlap = async (
  coachId: string,
  startEpoch: number,
  endEpoch: number,
) => {
  return CoachSlot.exists({
    coachId,
    status: { $in: ['available', 'booked'] },
    startEpoch: { $lt: endEpoch },
    endEpoch: { $gt: startEpoch },
  });
};

export const hasTimeConflict = (
  existingStart: number,
  existingEnd: number,
  newStart: number,
  newEnd: number,
) => existingStart < newEnd && existingEnd > newStart;
