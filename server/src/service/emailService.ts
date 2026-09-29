import axios from 'axios';
import envConfig from '../config/envConfig';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const recipients = Array.isArray(to) ? to : [to];

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: envConfig.EMAIL_FROM_NAME,
          email: envConfig.EMAIL_FROM,
        },
        to: recipients.map((email) => ({
          email,
        })),
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': envConfig.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    console.log('Email sent successfully:', response.data.messageId);

    return response.data;
  } catch (error) {
    console.error('Email error:', error);
  }
};
