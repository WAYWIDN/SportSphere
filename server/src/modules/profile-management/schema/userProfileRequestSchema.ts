import { z } from 'zod';

export const updateUserProfileRequestSchema = z.object({
  profileData: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    age: z.number().int().min(0).max(120).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    profilePictureUrl: z.url({ message: 'Invalid URL format' }).optional(),
  }),
});

export const applicationDataSchema = z.object({
  applicationData: z.object({
    role: z.enum(['coach', 'venue-owner'], { message: 'Invalid role' }),
    documentUrl: z.url({ message: 'Invalid URL format' }),
  }),
});
