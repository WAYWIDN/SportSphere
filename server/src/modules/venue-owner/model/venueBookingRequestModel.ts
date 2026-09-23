import { Document, model, Schema, Types } from 'mongoose';

export interface IVenueBookingRequest extends Document {
  userId: Types.ObjectId;
  venueOwnerId: Types.ObjectId;
  subvenueId: Types.ObjectId;
  slotId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

const venueBookingRequestSchema = new Schema<IVenueBookingRequest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  venueOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subvenueId: {
    type: Schema.Types.ObjectId,
    ref: 'Subvenue',
    required: true,
  },
  slotId: { type: Schema.Types.ObjectId, ref: 'VenueSlot', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

venueBookingRequestSchema.index({ userId: 1, slotId: 1 }, { unique: true });
venueBookingRequestSchema.index({ venueOwnerId: 1, status: 1, _id: -1 });

export const VenueBookingRequest = model<IVenueBookingRequest>(
  'VenueBookingRequest',
  venueBookingRequestSchema,
);