import { Job, Worker } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../config/envConfig';
import { transporter } from '../config/nodeMailerConfig';
import { User } from '../modules/auth/model/userModel';
import {
  GameNotificationData,
  gameNotificationQueue,
} from '../modules/game/utils/gameNotificationQueue';
import { getGameNotificationTemplate } from '../modules/game/utils/gameNotificationTemplate';

const sendGameNotification = async (job: Job<GameNotificationData>) => {
  const users = await User.find({ _id: { $in: job.data.recipientIds } })
    .select('email')
    .lean();

  if (users.length === 0) {
    throw new Error(
      `Game notification recipients not found: ${job.data.gameId}`,
    );
  }

  let subject = 'SportSphere - Game update';
  if (job.data.status === 'join-requested') {
    subject = 'SportSphere - New game join request';
  } else if (job.data.status === 'join-accepted') {
    subject = 'SportSphere - Game join request accepted';
  } else if (job.data.status === 'join-rejected') {
    subject = 'SportSphere - Game join request rejected';
  } else if (job.data.status === 'minimum-reached') {
    subject = 'SportSphere - Game is ready';
  } else if (job.data.status === 'booked') {
    subject = 'SportSphere - Game booked';
  } else if (job.data.status === 'cancelled') {
    subject = 'SportSphere - Game cancelled';
  }

  await transporter.sendMail({
    from: envConfig.EMAIL_USER,
    to: users.map((user) => user.email),
    subject,
    html: getGameNotificationTemplate(job.data.status),
  });
};

export const startGameNotificationWorker = () => {
  const workerConnection = new Redis(envConfig.REDIS_URI, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker<GameNotificationData>(
    gameNotificationQueue.name,
    sendGameNotification,
    { connection: workerConnection },
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Game notification sent: ${job.data.gameId}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Game notification failed: ${job?.data.gameId}`, error);
  });

  return worker;
};
