import { Document, model, Schema, Types } from 'mongoose';

export interface ICoachProfile extends Document {
  coachId: Types.ObjectId;
  bio: string;
  experience: number;
  sports: string[];
  photos: string[];
  coachingCenter: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const coachProfileSchema = new Schema<ICoachProfile>({
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: { type: String, required: true, trim: true },
  experience: { type: Number, required: true, min: 0 },
  sports: { type: [String], required: true },
  photos: { type: [String], default: [] },
  coachingCenter: {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CoachProfile = model<ICoachProfile>(
  'CoachProfile',
  coachProfileSchema,
);
