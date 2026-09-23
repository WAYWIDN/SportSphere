import { Job, Worker } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../config/envConfig';
import { transporter } from '../config/nodeMailerConfig';
import { Booking } from '../modules/booking/model/bookingModel';
import { SessionRequest } from '../modules/coach/model/sessionRequestModel';
import { CoachSlot } from '../modules/coach/model/coachSlotModel';
import {
  BookingNotificationData,
  bookingNotificationQueue,
} from '../modules/booking/utils/bookingNotificationQueue';
import { getBookingNotificationTemplate } from '../modules/booking/utils/bookingNotificationTemplate';
import { User } from '../modules/auth/model/userModel';

const sendBookingNotification = async (job: Job<BookingNotificationData>) => {
  if (job.data.status === 'rejected') {
    if (!job.data.requestId) {
      throw new Error('Request ID is required for rejected notifications');
    }

    const request = await SessionRequest.findById(job.data.requestId).lean();
    if (!request) {
      throw new Error(`Session request not found: ${job.data.requestId}`);
    }
    if (request.status !== 'rejected') {
      return;
    }

    const slot = await CoachSlot.findById(request.slotId).lean();
    const [user, provider] = await Promise.all([
      User.findById(request.userId).select('email').lean(),
      User.findById(request.coachId).select('email').lean(),
    ]);
    if (!user || !provider || !slot) {
      throw new Error(`Request participants not found: ${job.data.requestId}`);
    }

    await transporter.sendMail({
      from: envConfig.EMAIL_USER,
      to: [user.email, provider.email],
      subject: 'SportSphere - Booking request rejected',
      html: getBookingNotificationTemplate(
        job.data.status,
        slot.startEpoch,
        slot.endEpoch,
      ),
    });
    return;
  }

  if (!job.data.bookingId) {
    throw new Error('Booking ID is required for booking notifications');
  }

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
    const notificationId = job.data.bookingId ?? job.data.requestId;
    console.log(`Booking notification sent: ${notificationId}`);
  });

  worker.on('failed', (job, error) => {
    const notificationId = job?.data.bookingId ?? job?.data.requestId;
    console.error(`Booking notification failed: ${notificationId}`, error);
  });

  return worker;
};
