import { Document, model, Schema, Types } from 'mongoose';

export interface IGameJoinRequest extends Document {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

const gameJoinRequestSchema = new Schema<IGameJoinRequest>({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

gameJoinRequestSchema.index({ gameId: 1, userId: 1 }, { unique: true });
gameJoinRequestSchema.index({ gameId: 1, status: 1 });
gameJoinRequestSchema.index({ userId: 1, status: 1 });

export const GameJoinRequest = model<IGameJoinRequest>(
  'GameJoinRequest',
  gameJoinRequestSchema,
);
