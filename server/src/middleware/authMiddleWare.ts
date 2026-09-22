import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../modules/auth/utils/jwtUtils';
import { redisClient } from '../config/redisConfig';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided' });
  }

  const decodedToken = verifyJWT(token);
  if (!decodedToken) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const check = await redisClient.get(`jwtBlacklist-${token}`);
  if (check === 'true') {
    return res
      .status(401)
      .json({ success: false, message: 'Token is blacklisted' });
  }

  req.userMetadata = decodedToken;
  next();
};
