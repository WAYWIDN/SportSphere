import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../auth/model/userModel';
import { ApplicationCoachOrVenueOwner } from '../../profile-management/model/applyForCoachOrVenueOwnerControllerSchema';
import { UserProfile } from '../../profile-management/model/userProfileModel';

const PAGE_SIZE = 10;

export const getPendingApplicationsController = async (
  req: Request,
  res: Response,
) => {
  const lastApplicationId = req.query.lastApplicationId as string | undefined;
  try {
    const applicationQuery: {
      status: 'pending';
      _id?: { $lt: Types.ObjectId };
    } = {
      status: 'pending',
      ...(lastApplicationId
        ? { _id: { $lt: new Types.ObjectId(lastApplicationId) } }
        : {}),
    };

    const applications = await ApplicationCoachOrVenueOwner.find(
      applicationQuery,
    )
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .lean();

    const hasNext = applications.length > PAGE_SIZE;
    const page = applications.slice(0, PAGE_SIZE);
    const userIds = page.map((application) => application.userId);
    const profiles = await UserProfile.find({ userId: { $in: userIds } })
      .select('userId firstName lastName')
      .lean();
    const profilesByUserId = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );

    return res.status(200).json({
      success: true,
      data: page.map((application) => {
        const profile = profilesByUserId.get(application.userId.toString());
        return {
          applicationId: application._id,
          profileId: application.userId,
          profileName: [profile?.firstName, profile?.lastName]
            .filter(Boolean)
            .join(' '),
          requestType: application.role,
          documentUrl: application.documentUrl,
        };
      }),
      pagination: {
        limit: PAGE_SIZE,
        lastApplicationId: hasNext ? page[page.length - 1]._id : null,
        hasNext,
      },
    });
  } catch (error) {
    console.error('Error retrieving pending applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending applications',
    });
  }
};

export const updateApplicationStatusController = async (
  req: Request,
  res: Response,
) => {
  const applicationId = req.params.applicationId as string;
  const status = req.body.status as 'approved' | 'rejected';

  try {
    const application = await ApplicationCoachOrVenueOwner.findOneAndUpdate(
      { _id: applicationId, status: 'pending' },
      { status, updatedAt: new Date() },
      { new: true },
    );

    if (!application) {
      return res.status(409).json({
        success: false,
        message: 'Application was not found or has already been processed',
      });
    }

    if (status === 'approved') {
      await User.findByIdAndUpdate(application.userId, {
        role: application.role,
      });
    }

    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
    });
  }
};
