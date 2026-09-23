import { Document, model, Schema, Types } from 'mongoose';

export interface IVenue extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  sports: string[];
  facilities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  location: {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  sports: { type: [String], required: true },
  facilities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

venueSchema.index({ ownerId: 1, _id: -1 });

export const Venue = model<IVenue>('Venue', venueSchema);
