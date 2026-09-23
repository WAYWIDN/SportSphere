import { CoachSlot } from '../model/coachSlotModel';

export const hasSlotOverlap = async (
  coachId: string,
  date: string,
  startEpoch: number,
  endEpoch: number,
) => {
  return CoachSlot.exists({
    coachId,
    date,
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
