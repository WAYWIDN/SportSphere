import { Document, model, Schema, Types } from 'mongoose';

export interface IVenueSlot extends Document {
  subvenueId: Types.ObjectId;
  date: string;
  startEpoch: number;
  endEpoch: number;
  price: number;
  status: 'available' | 'booked' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const slotSchema = new Schema<IVenueSlot>({
  subvenueId: {
    type: Schema.Types.ObjectId,
    ref: 'Subvenue',
    required: true,
  },
  date: { type: String, required: true },
  startEpoch: { type: Number, required: true },
  endEpoch: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled'],
    default: 'available',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

slotSchema.index({ subvenueId: 1, date: 1, startEpoch: 1 });

export const VenueSlot = model<IVenueSlot>('VenueSlot', slotSchema);
