import { OTPEmailType, queueOTPEmail } from '../utils/otpEmailQueue';

export const sendOTPEmailService = async (
  email: string,
  otp: string,
  type: OTPEmailType,
) => {
  await queueOTPEmail({
    email,
    otp,
    type,
  });
};
