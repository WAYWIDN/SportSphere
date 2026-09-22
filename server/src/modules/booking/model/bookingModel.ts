import { Document, model, Schema, Types } from 'mongoose';

export interface IBooking extends Document {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  providerType: 'coach' | 'venue';
  resourceId: Types.ObjectId;
  sourceRequestId: Types.ObjectId;
  startEpoch: number;
  endEpoch: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerType: { type: String, enum: ['coach', 'venue'], required: true },
  resourceId: { type: Schema.Types.ObjectId, required: true },
  sourceRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'SessionRequest',
    required: true,
    unique: true,
  },
  startEpoch: { type: Number, required: true },
  endEpoch: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookingSchema.index({ userId: 1, _id: -1 });
bookingSchema.index({ providerId: 1, providerType: 1, startEpoch: -1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
