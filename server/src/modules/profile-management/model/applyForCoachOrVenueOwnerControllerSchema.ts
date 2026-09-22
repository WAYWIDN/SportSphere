import { Document, model, Schema, Types } from 'mongoose';

export interface IApplicationCoachOrVenueOwner extends Document {
  userId: Types.ObjectId;
  role: 'coach' | 'venue-owner';
  status: 'pending' | 'approved' | 'rejected';
  documentUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationCoachOrVenueOwnerSchema: Schema<IApplicationCoachOrVenueOwner> =
  new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: { type: String, enum: ['coach', 'venue-owner'], required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    documentUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

applicationCoachOrVenueOwnerSchema.index({ status: 1, _id: -1 });
applicationCoachOrVenueOwnerSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'approved'] },
    },
  },
);

export const ApplicationCoachOrVenueOwner =
  model<IApplicationCoachOrVenueOwner>(
    'Application',
    applicationCoachOrVenueOwnerSchema,
  );
