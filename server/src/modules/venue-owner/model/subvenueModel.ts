import { Document, model, Schema, Types } from 'mongoose';

export interface ISubvenue extends Document {
  venueId: Types.ObjectId;
  name: string;
  sport: string;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const subvenueSchema = new Schema<ISubvenue>({
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  name: { type: String, required: true, trim: true },
  sport: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

subvenueSchema.index({ venueId: 1, _id: -1 });

export const Subvenue = model<ISubvenue>('Subvenue', subvenueSchema);
