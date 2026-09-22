import { Document, model, Schema, Types } from 'mongoose';

interface IUserProfile extends Document {
  userId: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema: Schema<IUserProfile> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  age: { type: Number, min: 0, max: 120 },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  profilePictureUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserProfile = model<IUserProfile>(
  'UserProfile',
  userProfileSchema,
);
