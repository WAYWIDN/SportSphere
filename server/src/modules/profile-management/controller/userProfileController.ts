import { Request, Response } from 'express';
import { UserProfile } from '../model/userProfileModel';
import { ApplicationCoachOrVenueOwner } from '../model/applyForCoachOrVenueOwnerControllerSchema';
import { User } from '../../auth/model/userModel';
import { Types } from 'mongoose';
import { checkProfileCompleted } from '../utils/checkProfileCompletedUtils';

export const getUserProfileController = async (req: Request, res: Response) => {
  const id = req.userMetadata?.id;
  console.log('User ID from token:', id);
  try {
    const userProfile = await UserProfile.findOne({ userId: id });
    if (!userProfile) {
      return res
        .status(404)
        .json({ success: false, message: 'User profile not found' });
    }
    const role = req.userMetadata?.role;
    const finalProfile = { ...userProfile?.toObject(), role: role };
    return res.status(200).json({ success: true, data: finalProfile });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve user profile' });
  }
};

export const getUserProfileByIdController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.params.userId;

  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    if (userId) {
      const userRole = await User.findOne({ _id: userId }).select('role');
      if (!userRole) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }

      // Admins can view the full profile for an application review.
      if (userRole.role !== 'player' || req.userMetadata?.role === 'admin') {
        const userProfile = await UserProfile.findOne({
          userId: userId,
        });
        if (!userProfile) {
          return res
            .status(404)
            .json({ success: false, message: 'User profile not found' });
        }
        return res.status(200).json({ success: true, data: userProfile });
      } else {
        const userProfile = await UserProfile.findOne({
          userId: userId,
        }).select('userId firstName lastName profilePictureUrl gender');
        if (!userProfile) {
          return res
            .status(404)
            .json({ success: false, message: 'User profile not found' });
        }

        return res.status(200).json({ success: true, data: userProfile });
      }
    }
  } catch (error) {
    console.error('Error retrieving user profile by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile by ID',
    });
  }
};

export const updateUserProfileController = async (
  req: Request,
  res: Response,
) => {
  const id = req.userMetadata?.id;
  const role = req.userMetadata?.role;

  // As a coach&venue-owner you need to fill all the required fields in the profile before you can update it.
  if (role == 'coach' || role == 'venue-owner') {
    const existingProfile = await UserProfile.findOne({ userId: id });
    if (!existingProfile) {
      return res
        .status(404)
        .json({ success: false, message: 'User profile not found' });
    }
    const mergedProfileData = {
      ...existingProfile.toObject(),
      ...req.body.profileData,
    };
    const isProfileCompleted = checkProfileCompleted(mergedProfileData);
    if (!isProfileCompleted) {
      res.status(400).json({
        success: false,
        message: 'Profile is not complete. Please fill all required fields.',
      });
      return;
    }
  }
  const updateData = req.body.profileData;
  const allowedFields = [
    'firstName',
    'lastName',
    'phoneNumber',
    'gender',
    'age',
    'address',
    'city',
    'state',
    'profilePictureUrl',
  ];

  const filteredUpdateData: any = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredUpdateData[field] = updateData[field];
    }
  }

  const updateDataWithTimestamp = {
    ...filteredUpdateData,
    updatedAt: new Date(),
  };

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: id },
      updateDataWithTimestamp,
      { new: true },
    );
    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: 'User profile not found' });
    }
    return res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update user profile' });
  }
};

export const applyForCoachOrVenueOwnerController = async (
  req: Request,
  res: Response,
) => {
  const id = req.userMetadata?.id;

  try {
    const user = await User.findById(id).select('role');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'player') {
      return res.status(400).json({
        success: false,
        message: 'Only players can apply to become a coach or venue owner',
      });
    }

    const existingApplication = await ApplicationCoachOrVenueOwner.exists({
      userId: id,
      status: { $in: ['pending', 'approved'] },
    });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending or approved application',
      });
    }

    const profile = await UserProfile.findOne({ userId: id });
    if (!checkProfileCompleted(profile)) {
      return res.status(400).json({
        success: false,
        message:
          'Please complete your profile before applying to become a coach or venue owner',
      });
    }

    const newApplication = new ApplicationCoachOrVenueOwner({
      userId: id,
      role: req.body.applicationData.role,
      documentUrl: req.body.applicationData.documentUrl,
    });
    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending or approved application',
      });
    }

    console.error('Error creating application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check profile completion or create application',
    });
  }
};
