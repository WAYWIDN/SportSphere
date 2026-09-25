import { Job, Worker } from 'bullmq';
import Redis from 'ioredis';
import envConfig from '../config/envConfig';
import { transporter } from '../config/nodeMailerConfig';

import {
  OTPEmailData,
  otpEmailQueue,
} from '../modules/auth/utils/otpEmailQueue';

import {
  getRegisterMailTemplate,
  getResetPasswordMailTemplate,
} from '../modules/auth/utils/emailTemplateUtils';

const sendOTPEmail = async (job: Job<OTPEmailData>) => {
  const { email, otp, type } = job.data;

  let subject: string;
  let html: string;

  if (type === 'register') {
    subject = 'SportSphere - Verify your email';
    html = getRegisterMailTemplate(otp);
  } else {
    subject = 'SportSphere - Reset your password';
    html = getResetPasswordMailTemplate(otp);
  }

  await transporter.sendMail({
    from: envConfig.EMAIL_USER,
    to: email,
    subject,
    html,
  });
};

export const startOTPEmailWorker = () => {
  const workerConnection = new Redis(envConfig.REDIS_URI, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker<OTPEmailData>(otpEmailQueue.name, sendOTPEmail, {
    connection: workerConnection,
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] OTP email sent: ${job.data.type} → ${job.data.email}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`OTP email failed: ${job?.data.email}`, error);
  });

  return worker;
};
