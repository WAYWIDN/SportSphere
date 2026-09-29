import dotenv from 'dotenv';
dotenv.config();

const envConfig = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI!,
  REDIS_URI: process.env.REDIS_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  BREVO_API_KEY: process.env.BREVO_API_KEY!,
  EMAIL_FROM: process.env.EMAIL_FROM!,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME!,
};
export default envConfig;
