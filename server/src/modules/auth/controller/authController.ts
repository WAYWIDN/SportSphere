import { Request, Response } from 'express';
import { redisClient } from '../../../config/redisConfig';
import { User } from '../model/userModel';
import { UserProfile } from '../../profile-management/model/userProfileModel';
import { generateOTP, otpRateLimiter } from '../utils/otpUtils';
import { generateJWT, calculateJWTExpiration } from '../utils/jwtUtils';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { queueOTPEmail } from '../utils/otpEmailQueue';

const OTP_EXPIRATION_TIME = 10 * 60; // 10 minutes in seconds

export const sendOTPController = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const type: 'register' | 'reset-password' | 'forgot-password' = req.body.type;

  // Registration: check if user already exists
  if (type === 'register') {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }
  }

  // Forgot password : can change without login
  // Reset password : can change only after login
  if (type == 'forgot-password') {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Email Id' });
    }
  }

  // Limit OTP requests to 5 per day per email and type
  try {
    const isWithinLimit = await otpRateLimiter(email, type);
    if (!isWithinLimit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, Try After 1 Day',
      });
    }
  } catch (error) {
    console.error('Error in OTP rate limiter:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Something went wrong' });
  }

  const otp = generateOTP();

  let redisKey: string;
  redisKey =
    type === 'register' ? `register:${email}` : `reset-password:${email}`;

  try {
    await redisClient.del(redisKey); // delete any existing OTP for the email
    await redisClient.setex(redisKey, OTP_EXPIRATION_TIME, otp);
    await queueOTPEmail({
      email,
      otp,
      type,
    });
    return res
      .status(200)
      .json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOTPController = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const otp: string = req.body.otp;
  const type: 'register' | 'reset-password' | 'forgot-password' = req.body.type;

  let redisKey: string;
  redisKey =
    type === 'register' ? `register:${email}` : `reset-password:${email}`;

  try {
    const storedOTP = await redisClient.get(redisKey);
    if (storedOTP === otp) {
      await redisClient.setex(redisKey, OTP_EXPIRATION_TIME, 'verified');
      return res
        .status(200)
        .json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to verify OTP' });
  }
};

export const registerUserController = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;

  try {
    const redisKey = `register:${email}`;
    const otpStatus = await redisClient.get(redisKey);
    if (otpStatus !== 'verified') {
      return res
        .status(400)
        .json({ success: false, message: 'OTP not verified' });
    } else {
      const hashedPassword = await hashPassword(password);
      // default role is player and verified is false
      const newUser = new User({ email: email, password: hashedPassword });
      const newUserProfile = new UserProfile({
        userId: newUser._id,
        email: email,
      });
      await newUserProfile.save();
      await newUser.save();
      await redisClient.del(redisKey);
      return res
        .status(201)
        .json({ success: true, message: 'User registered successfully' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to register user' });
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password' });
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateJWT({
      id: user._id.toString(),
      role: user.role,
      isVerified: user.isVerified,
    });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to login user' });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const newPassword: string = req.body.newPassword;
  const jwtToken: string | undefined = req.cookies.token;

  try {
    let redisKey = `reset-password:${email}`;
    const otpStatus = await redisClient.get(redisKey);
    if (otpStatus !== 'verified') {
      return res
        .status(400)
        .json({ success: false, message: 'OTP not verified' });
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'User not found' });
      } else {
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();
        await redisClient.del(redisKey);
        if (jwtToken) {
          const expirationTime = calculateJWTExpiration(jwtToken);
          await redisClient.setex(
            `jwtBlacklist-${jwtToken}`,
            expirationTime > 0 ? expirationTime : 7 * 24 * 60 * 60, // Set expiration time for the blacklist entry
            'true',
          ); // Add the old JWT to the blacklist
        }
        res.cookie('token', '', { maxAge: 0, httpOnly: true }); // Clear the token cookie
        return res
          .status(200)
          .json({ success: true, message: 'Password reset successfully' });
      }
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to reset password' });
  }
};

export const logoutUserController = async (req: Request, res: Response) => {
  const jwtToken: string | undefined = req.cookies.token;
  try {
    if (jwtToken) {
      const expirationTime = calculateJWTExpiration(jwtToken);
      await redisClient.setex(
        `jwtBlacklist-${jwtToken}`,
        expirationTime > 0 ? expirationTime : 7 * 24 * 60 * 60,
        'true',
      ); // Add the JWT to the blacklist
    }
    res.cookie('token', '', { maxAge: 0, httpOnly: true });
    return res
      .status(200)
      .json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to logout user' });
  }
};

export const authMeController = async (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ success: true, userMetadata: req.userMetadata });
};
