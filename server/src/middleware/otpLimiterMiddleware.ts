// import { Request, Response, NextFunction } from 'express';
// import { redisClient } from '../config/redisConfig';

// const MAX_OTP_PER_DAY = 5;
// const WINDOW_SECONDS = 24 * 60 * 60; // 24 hours

// export const otpRateLimiter = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const email: string = req.body.email;
//   const type: string = req.body.type;

//   if (!email) {
//     return next(); // let validate() handle missing email, not this middleware
//   }

//   const key = `otp-limit:${type}:${email}`;

//   try {
//     const count = await redisClient.incr(key);

//     // Only set expiry on the FIRST request in this window,
//     // otherwise every subsequent call would keep resetting the TTL
//     if (count === 1) {
//       await redisClient.expire(key, WINDOW_SECONDS);
//     }

//     if (count > MAX_OTP_PER_DAY) {
//       const ttl = await redisClient.ttl(key);
//       return res.status(429).json({
//         success: false,
//         message: `Too many OTP requests. Try again in ${Math.ceil(ttl / 3600)} hour(s).`,
//       });
//     }

//     next();
//   } catch (error) {
//     console.error('Error in OTP rate limiter:', error);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Something went wrong' });
//   }
// };
