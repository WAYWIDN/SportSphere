import jwt from 'jsonwebtoken';
import envConfig from '../../../config/envConfig';
import { redisClient } from '../../../config/redisConfig';

export interface AuthTokenPayload {
  id: string;
  role: string;
  isVerified: boolean;
}

export const generateJWT = (payload: AuthTokenPayload): string => {
  const secretKey = envConfig.JWT_SECRET;
  return jwt.sign(payload, secretKey, { expiresIn: '7d' });
};

export const verifyJWT = (token: string): AuthTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);
    return decoded as AuthTokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export const decodeJWT = (token: string): AuthTokenPayload | null => {
  try {
    const decoded = jwt.decode(token);
    return decoded as AuthTokenPayload;
  } catch (error) {
    console.error('JWT decoding failed:', error);
    return null;
  }
};

export const calculateJWTExpiration = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    return Math.ceil((decoded.exp * 1000 - Date.now()) / 1000);
  } catch (error) {
    console.error('Error calculating JWT expiration:', error);
    return 0;
  }
};

export const isJWTBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const isBlacklisted = await redisClient.get(`jwtBlacklist-${token}`);
    return isBlacklisted === 'true';
  } catch (error) {
    console.error('Error checking JWT blacklist:', error);
    return false;
  }
};
