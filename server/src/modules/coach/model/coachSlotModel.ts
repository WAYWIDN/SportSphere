import { Document, model, Schema, Types } from 'mongoose';

export interface ICoachSlot extends Document {
  coachId: Types.ObjectId;
  date: string;
  startEpoch: number;
  endEpoch: number;
  status: 'available' | 'booked' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const coachSlotSchema = new Schema<ICoachSlot>({
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: String, required: true },
  startEpoch: { type: Number, required: true },
  endEpoch: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled'],
    default: 'available',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

coachSlotSchema.index({ coachId: 1, date: 1, status: 1, startEpoch: 1 });

export const CoachSlot = model<ICoachSlot>('CoachSlot', coachSlotSchema);
