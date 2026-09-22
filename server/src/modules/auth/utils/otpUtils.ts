import { redisClient } from '../../../config/redisConfig';

const MAX_OTP_PER_DAY = 5;
const WINDOW_SECONDS = 24 * 60 * 60; // 24 hours

export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

export const otpRateLimiter = async (
  email: string,
  type: string,
): Promise<boolean> => {
  const key = `otp-limit:${type}:${email}`;

  try {
    const count = await redisClient.incr(key);

    if (count == 1) redisClient.expire(key, WINDOW_SECONDS);

    if (count > MAX_OTP_PER_DAY) {
      return false;
    }
  } catch (error) {
    console.error('Error in OTP limiter:', error);
    throw new Error('Something went wrong');
  }

  return true;
};
