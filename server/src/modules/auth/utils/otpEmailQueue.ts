import { Queue } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../../../config/envConfig';

export type OTPEmailType = 'register' | 'reset-password' | 'forgot-password';

export interface OTPEmailData {
  email: string;
  otp: string;
  type: OTPEmailType;
}

const createQueueConnection = () =>
  new Redis(envConfig.REDIS_URI, {
    maxRetriesPerRequest: null,
  });

export const otpEmailQueue = new Queue<OTPEmailData>('otp-emails', {
  connection: createQueueConnection(),
});

export const queueOTPEmail = async (data: OTPEmailData) => {
  await otpEmailQueue.add(`otp-${data.type}`, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
