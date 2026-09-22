import mongoose from 'mongoose';
import envConfig from './envConfig';

export const connectDB = async (): Promise<void> => {
  const uri = envConfig.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection failed: ❌', err);
    process.exit(1);
  }
};
