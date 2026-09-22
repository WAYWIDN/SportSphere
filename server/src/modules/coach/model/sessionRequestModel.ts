import { Document, model, Schema, Types } from 'mongoose';

export interface ISessionRequest extends Document {
  userId: Types.ObjectId;
  coachId: Types.ObjectId;
  slotId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const sessionRequestSchema = new Schema<ISessionRequest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  slotId: { type: Schema.Types.ObjectId, ref: 'CoachSlot', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

sessionRequestSchema.index({ userId: 1, slotId: 1 }, { unique: true });
sessionRequestSchema.index({ coachId: 1, _id: -1 });
sessionRequestSchema.index({ userId: 1, _id: -1 });

export const SessionRequest = model<ISessionRequest>(
  'SessionRequest',
  sessionRequestSchema,
);
