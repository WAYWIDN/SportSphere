import { Document, model, Schema, Types } from 'mongoose';

export interface IGame extends Document {
  creatorId: Types.ObjectId;
  subvenueId: Types.ObjectId;
  slotId: Types.ObjectId;
  minimumPlayers: number;
  maximumPlayers: number;
  acceptedPlayerIds: Types.ObjectId[];
  status: 'forming' | 'ready' | 'booked' | 'cancelled';
  bookingId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subvenueId: {
    type: Schema.Types.ObjectId,
    ref: 'Subvenue',
    required: true,
  },
  slotId: { type: Schema.Types.ObjectId, ref: 'VenueSlot', required: true },
  minimumPlayers: { type: Number, required: true, min: 1 },
  maximumPlayers: { type: Number, required: true, min: 1 },
  acceptedPlayerIds: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required: true,
    default: [],
  },
  status: {
    type: String,
    enum: ['forming', 'ready', 'booked', 'cancelled'],
    default: 'forming',
  },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

gameSchema.index({ subvenueId: 1, status: 1, createdAt: -1 });
gameSchema.index({ creatorId: 1, createdAt: -1 });

export const Game = model<IGame>('Game', gameSchema);
