import { Queue } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../../../config/envConfig';

export type BookingNotificationStatus = 'confirmed' | 'rejected' | 'cancelled';

export interface BookingNotificationData {
  bookingId?: string;
  requestId?: string;
  status: BookingNotificationStatus;
}

const createQueueConnection = () =>
  new Redis(envConfig.REDIS_URI, { maxRetriesPerRequest: null });

export const bookingNotificationQueue = new Queue<BookingNotificationData>(
  'booking-notifications',
  { connection: createQueueConnection() },
);

export const queueBookingNotification = async (
  data: BookingNotificationData,
) => {
  await bookingNotificationQueue.add(`booking-${data.status}`, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
