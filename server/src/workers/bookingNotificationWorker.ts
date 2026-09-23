import { Job, Worker } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../config/envConfig';
import { transporter } from '../config/nodeMailerConfig';
import { Booking } from '../modules/booking/model/bookingModel';
import {
  BookingNotificationData,
  bookingNotificationQueue,
} from '../modules/booking/utils/bookingNotificationQueue';
import { getBookingNotificationTemplate } from '../modules/booking/utils/bookingNotificationTemplate';
import { User } from '../modules/auth/model/userModel';

const sendBookingNotification = async (job: Job<BookingNotificationData>) => {
  const booking = await Booking.findById(job.data.bookingId).lean();
  if (!booking) {
    throw new Error(`Booking not found: ${job.data.bookingId}`);
  }
  if (booking.status !== job.data.status) {
    return;
  }

  const [user, provider] = await Promise.all([
    User.findById(booking.userId).select('email').lean(),
    User.findById(booking.providerId).select('email').lean(),
  ]);
  if (!user || !provider) {
    throw new Error(`Booking participants not found: ${job.data.bookingId}`);
  }

  await transporter.sendMail({
    from: envConfig.EMAIL_USER,
    to: [user.email, provider.email],
    subject:
      job.data.status === 'confirmed'
        ? 'SportSphere - Booking confirmed'
        : 'SportSphere - Booking cancelled',
    html: getBookingNotificationTemplate(
      job.data.status,
      booking.startEpoch,
      booking.endEpoch,
    ),
  });
};

export const startBookingNotificationWorker = () => {
  const workerConnection = new Redis(envConfig.REDIS_URI, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker<BookingNotificationData>(
    bookingNotificationQueue.name,
    sendBookingNotification,
    { connection: workerConnection },
  );

  worker.on('completed', (job) => {
    console.log(`Booking notification sent: ${job.data.bookingId}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Booking notification failed: ${job?.data.bookingId}`, error);
  });

  return worker;
};
