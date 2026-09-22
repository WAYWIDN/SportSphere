import nodemailer from 'nodemailer';
import envConfig from './envConfig';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_PASS,
  },
});

const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();
    console.log('Email transporter is ready to send emails ✅');
  } catch (error) {
    console.error('Error verifying email transporter ❌', error);
  }
};

verifyEmailTransporter();
