import Redis from 'ioredis';
import envConfig from './envConfig';

export const redisClient = new Redis(envConfig.REDIS_URI, {
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis ✅');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error: ❌', err);
});
