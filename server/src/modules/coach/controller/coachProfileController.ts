import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CoachProfile } from '../model/coachProfileModel';

export const createCoachProfileController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.userMetadata?.id;

  try {
    const existingProfile = await CoachProfile.findOne({ coachId });
    if (existingProfile) {
      return res
        .status(409)
        .json({ success: false, message: 'Coach profile already exists' });
    }

    const profile = await CoachProfile.create({
      ...req.body,
      coachId,
    });

    return res.status(201).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error creating coach profile:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create coach profile' });
  }
};

export const updateCoachProfileController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.userMetadata?.id;

  try {
    const profile = await CoachProfile.findOneAndUpdate(
      { coachId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Coach profile not found' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating coach profile:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update coach profile' });
  }
};

export const getCoachProfileController = async (
  req: Request,
  res: Response,
) => {
  const coachId = req.params.coachId;
  try {
    const profile = await CoachProfile.findOne({ coachId }).lean();
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Coach profile not found' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Error retrieving coach profile:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve coach profile' });
  }
};

export const searchCoachProfilesController = async (
  req: Request,
  res: Response,
) => {
  const { sport, city, state, minExperience, maxExperience, lastCoachId } =
    req.body as {
      sport?: string;
      city?: string;
      state?: string;
      minExperience?: number;
      maxExperience?: number;
      lastCoachId?: string;
    };

  try {
    const filter: Record<string, unknown> = {};

    if (sport) {
      filter.sports = { $regex: sport, $options: 'i' };
    }

    if (city) {
      filter['coachingCenter.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter['coachingCenter.state'] = { $regex: state, $options: 'i' };
    }

    if (minExperience !== undefined) {
      filter.experience = { $gte: minExperience };
    }

    if (maxExperience !== undefined) {
      const existing = (filter.experience as Record<string, number>) ?? {};
      filter.experience = { ...existing, $lte: maxExperience };
    }

    if (lastCoachId) {
      filter._id = { $lt: new Types.ObjectId(lastCoachId) };
    }

    const profiles = await CoachProfile.find(filter)
      .sort({ _id: -1 })
      .limit(11)
      .lean();

    const hasNext = profiles.length > 10;
    const page = profiles.slice(0, 10);

    return res.status(200).json({
      success: true,
      data: page,
      pagination: {
        limit: 10,
        lastCoachId: hasNext ? page[page.length - 1]._id : null,
        hasNext,
      },
    });
  } catch (error) {
    console.error('Error searching coach profiles:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to search coach profiles' });
  }
};
