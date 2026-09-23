import { Subvenue } from '../model/subvenueModel';

export const findOwnedSubvenue = async (
  subvenueId: string,
  ownerId: string,
) => {
  const subvenue = await Subvenue.findById(subvenueId).populate({
    path: 'venueId',
    match: { ownerId },
  });
  return subvenue?.venueId ? subvenue : null;
};
