import api from "../../../utils/api";
import { cleanObject } from "../../../utils/cleanObject";

export interface UserProfileData {
  _id?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  profilePictureUrl?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  profilePictureUrl?: string;
}

export interface ApplyCoachOrVenueOwnerData {
  role: "coach" | "venue-owner";
  documentUrl: string;
}

export const profileApi = {
  getUserProfile: async () => {
    const response = await api.get<{ success: boolean; data: UserProfileData }>("/v1/user-profile");
    return response.data;
  },

  getUserProfileById: async (userId: string) => {
    const response = await api.get<{ success: boolean; data: UserProfileData }>(`/v1/user-profile/${userId}`);
    return response.data;
  },

  updateUserProfile: async (profileData: UpdateProfileData) => {
    const cleanedData = cleanObject(profileData);
    const response = await api.post<{ success: boolean; data: UserProfileData }>("/v1/user-profile", {
      profileData: cleanedData,
    });
    return response.data;
  },

  applyForCoachOrVenueOwner: async (applicationData: ApplyCoachOrVenueOwnerData) => {
    const cleanedData = cleanObject(applicationData);
    const response = await api.post<{ success: boolean; message: string }>("/v1/apply-coach-venue-owner", {
      applicationData: cleanedData,
    });
    return response.data;
  },
};
