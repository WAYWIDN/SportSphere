import { Queue } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../../../config/envConfig';

export type GameNotificationStatus =
  | 'join-requested'
  | 'join-accepted'
  | 'join-rejected'
  | 'minimum-reached'
  | 'booked'
  | 'cancelled';

export interface GameNotificationData {
  gameId: string;
  recipientIds: string[];
  status: GameNotificationStatus;
}

const createQueueConnection = () =>
  new Redis(envConfig.REDIS_URI, { maxRetriesPerRequest: null });

export const gameNotificationQueue = new Queue<GameNotificationData>(
  'game-notifications',
  { connection: createQueueConnection() },
);

export const queueGameNotification = async (data: GameNotificationData) => {
  await gameNotificationQueue.add(`game-${data.status}`, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
