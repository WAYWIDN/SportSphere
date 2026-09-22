export const checkProfileCompleted = (userProfile: any): boolean => {
  const requiredFields = [
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

  for (const field of requiredFields) {
    if (!userProfile[field]) {
      return false;
    }
  }
  return true;
};
