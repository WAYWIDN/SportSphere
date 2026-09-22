import { z } from 'zod';

export const sendOTPRequestSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  type: z.enum(['register', 'reset-password', 'forgot-password'], {
    message: 'Invalid type',
  }),
});

export const verifyOTPRequestSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 characters long' }),
  type: z.enum(['register', 'reset-password', 'forgot-password'], {
    message: 'Invalid type',
  }),
});

export const registerUserRequestSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      },
    ),
});

export const loginUserRequestSchema = z.object({
  email: z.email({ message: 'Invalid credentials' }),
  password: z.string().min(6, { message: 'Invalid credentials' }),
});

export const resetPasswordRequestSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  newPassword: z
    .string()
    .min(6, { message: 'New password must be at least 6 characters long' })
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      {
        message:
          'New password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      },
    ),
});
