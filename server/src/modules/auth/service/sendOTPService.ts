import { transporter } from '../../../config/nodeMailerConfig';
import {
  getRegisterMailTemplate,
  getResetPasswordMailTemplate,
} from '../utils/emailTemplateUtils';

export const sendOTPEmailService = async (
  email: string,
  otp: string,
  type: 'register' | 'reset-password' | 'forgot-password',
) => {
  let _subject: string;
  let _html: string;

  if (type === 'register') {
    _subject = 'SportSphere - Verify your email';
    _html = getRegisterMailTemplate(otp);
  } else {
    _subject = 'SportSphere - Reset your password';
    _html = getResetPasswordMailTemplate(otp);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: _subject,
      html: _html,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
