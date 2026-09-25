import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Subvenue } from '../model/subvenueModel';
import { Venue } from '../model/venueModel';
import { VenueSlot } from '../model/slotModel';
import { findOwnedSubvenue } from '../utils/venueOwnershipUtils';

export const createVenueController = async (req: Request, res: Response) => {
  const ownerId = req.userMetadata?.id;

  try {
    const venue = await Venue.create({ ...req.body, ownerId });
    return res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      data: venue,
    });
  } catch (error) {
    console.error('Error creating venue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create venue' });
  }
};

export const searchVenuesController = async (req: Request, res: Response) => {
  const { name, city, state, country, sport, facility, lastVenueId } =
    req.body as {
      name?: string;
      city?: string;
      state?: string;
      country?: string;
      sport?: string;
      facility?: string;
      lastVenueId?: string;
    };

  try {
    const filter: Record<string, unknown> = {
      ownerId: req.userMetadata?.id,
    };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter['location.state'] = { $regex: state, $options: 'i' };
    }

    if (country) {
      filter['location.country'] = { $regex: country, $options: 'i' };
    }

    if (sport) {
      filter.sports = { $regex: sport, $options: 'i' };
    }

    if (facility) {
      filter.facilities = { $regex: facility, $options: 'i' };
    }

    if (lastVenueId) {
      filter._id = { $lt: new Types.ObjectId(lastVenueId) };
    }

    const venues = await Venue.find(filter).sort({ _id: -1 }).limit(11).lean();

    const hasNext = venues.length > 10;
    const page = venues.slice(0, 10);

    return res.status(200).json({
      success: true,
      data: page,
      pagination: {
        limit: 10,
        lastVenueId: hasNext ? page[page.length - 1]._id : null,
        hasNext,
      },
    });
  } catch (error) {
    console.error('Error searching venues:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to search venues' });
  }
};

export const getVenueController = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findById(req.params.venueId).lean();
    if (!venue) {
      return res
        .status(404)
        .json({ success: false, message: 'Venue not found' });
    }

    return res.status(200).json({ success: true, data: venue });
  } catch (error) {
    console.error('Error retrieving venue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve venue' });
  }
};

export const updateVenueController = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findOneAndUpdate(
      { _id: req.params.venueId, ownerId: req.userMetadata?.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!venue) {
      return res
        .status(404)
        .json({ success: false, message: 'Venue not found' });
    }

    return res.status(200).json({ success: true, data: venue });
  } catch (error) {
    console.error('Error updating venue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update venue' });
  }
};

export const deleteVenueController = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findOneAndDelete({
      _id: req.params.venueId,
      ownerId: req.userMetadata?.id,
    });
    if (!venue) {
      return res
        .status(404)
        .json({ success: false, message: 'Venue not found' });
    }

    const subvenues = await Subvenue.find({ venueId: venue._id }).select('_id');
    await VenueSlot.deleteMany({
      subvenueId: { $in: subvenues.map((subvenue) => subvenue._id) },
    });
    await Subvenue.deleteMany({ venueId: venue._id });

    return res
      .status(200)
      .json({ success: true, message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete venue' });
  }
};

export const createSubvenueController = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findOne({
      _id: req.params.venueId,
      ownerId: req.userMetadata?.id,
    });
    if (!venue) {
      return res
        .status(404)
        .json({ success: false, message: 'Venue not found' });
    }

    const subvenue = await Subvenue.create({ ...req.body, venueId: venue._id });
    return res.status(201).json({
      success: true,
      message: 'Subvenue created successfully',
      data: subvenue,
    });
  } catch (error) {
    console.error('Error creating subvenue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create subvenue' });
  }
};

export const getSubvenuesController = async (req: Request, res: Response) => {
  try {
    const subvenues = await Subvenue.find({ venueId: req.params.venueId })
      .sort({ _id: -1 })
      .lean();
    return res.status(200).json({ success: true, data: subvenues });
  } catch (error) {
    console.error('Error retrieving subvenues:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve subvenues' });
  }
};

export const getSubvenueController = async (req: Request, res: Response) => {
  try {
    const subvenue = await Subvenue.findById(req.params.subvenueId).lean();
    if (!subvenue) {
      return res
        .status(404)
        .json({ success: false, message: 'Subvenue not found' });
    }
    return res.status(200).json({ success: true, data: subvenue });
  } catch (error) {
    console.error('Error retrieving subvenue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve subvenue' });
  }
};

export const updateSubvenueController = async (req: Request, res: Response) => {
  const subvenueId = req.params.subvenueId as string;

  try {
    const subvenue = await findOwnedSubvenue(
      subvenueId,
      req.userMetadata?.id as string,
    );
    if (!subvenue) {
      return res
        .status(404)
        .json({ success: false, message: 'Subvenue not found' });
    }

    Object.assign(subvenue, req.body, { updatedAt: new Date() });
    await subvenue.save();
    return res.status(200).json({ success: true, data: subvenue });
  } catch (error) {
    console.error('Error updating subvenue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update subvenue' });
  }
};

export const deleteSubvenueController = async (req: Request, res: Response) => {
  const subvenueId = req.params.subvenueId as string;

  try {
    const subvenue = await findOwnedSubvenue(
      subvenueId,
      req.userMetadata?.id as string,
    );
    if (!subvenue) {
      return res
        .status(404)
        .json({ success: false, message: 'Subvenue not found' });
    }

    await VenueSlot.deleteMany({ subvenueId: subvenue._id });
    await subvenue.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: 'Subvenue deleted successfully' });
  } catch (error) {
    console.error('Error deleting subvenue:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete subvenue' });
  }
};
