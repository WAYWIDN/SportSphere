import { UserProfile } from '../model/userProfileModel';

export interface PublicUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export const loadPublicUsers = async (
  userIds: Array<{ toString(): string } | string | null | undefined>,
) => {
  const ids: string[] = [];

  for (const userId of userIds) {
    if (!userId) {
      continue;
    }

    const id = userId.toString();
    if (!ids.includes(id)) {
      ids.push(id);
    }
  }

  const profiles = await UserProfile.find({ userId: { $in: ids } })
    .select('userId firstName lastName')
    .lean();

  const users = new Map<string, PublicUser>();

  for (const profile of profiles) {
    users.set(profile.userId.toString(), {
      _id: profile.userId.toString(),
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    });
  }

  return users;
};

export const toPublicUser = (
  userId: { toString(): string },
  users: Map<string, PublicUser>,
): PublicUser => {
  const found = users.get(userId.toString());

  if (found) {
    return found;
  }

  return {
    _id: userId.toString(),
    firstName: '',
    lastName: '',
  };
};
