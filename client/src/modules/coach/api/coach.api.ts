import api from "../../../utils/api";
import { cleanObject } from "../../../utils/cleanObject";

export interface CoachingCenter {
  name: string;
  address: string;
  city: string;
  state: string;
}

export interface CoachProfileData {
  _id?: string;
  coachId: string;
  bio: string;
  experience: number;
  sports: string[];
  photos?: string[];
  profilePictureUrl?: string;
  coachingCenter: CoachingCenter;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCoachProfileInput {
  bio: string;
  experience: number;
  sports: string[];
  photos?: string[];
  coachingCenter: CoachingCenter;
}

export interface UpdateCoachProfileInput {
  bio?: string;
  experience?: number;
  sports?: string[];
  photos?: string[];
  coachingCenter?: Partial<CoachingCenter>;
}

export interface CoachSearchFilters {
  sport?: string;
  city?: string;
  state?: string;
  minExperience?: number;
  maxExperience?: number;
  lastCoachId?: string;
}

export interface CoachSlotData {
  _id: string;
  coachId: string;
  date: string;
  startEpoch: number;
  endEpoch: number;
  status: "available" | "booked" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCoachSlotInput {
  date: string;
  startEpoch: number;
  endEpoch: number;
}

export interface CoachSlotPagination {
  limit: number;
  lastStartEpoch: number | null;
  hasNext: boolean;
}

export interface SessionRequestItem {
  _id: string;
  userId: string | { _id: string; email: string };
  coachId: string | { _id: string; email: string };
  slotId: string | CoachSlotData;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export const coachApi = {
  // Coach Profile APIs

  createProfile: async (data: CreateCoachProfileInput) => {
    const cleaned = cleanObject(data);

    const response = await api.post<{
      success: boolean;
      data: CoachProfileData;
    }>("/v1/coach/profile", cleaned);

    return response.data;
  },

  updateProfile: async (data: UpdateCoachProfileInput) => {
    const cleaned = cleanObject(data);

    const response = await api.patch<{
      success: boolean;
      data: CoachProfileData;
    }>("/v1/coach/profile", cleaned);

    return response.data;
  },

  getProfile: async (coachId: string) => {
    const response = await api.get<{
      success: boolean;
      data: CoachProfileData;
    }>(`/v1/coaches/${coachId}`);

    return response.data;
  },

  searchProfiles: async (filters: CoachSearchFilters) => {
    const cleaned = cleanObject(filters);

    const response = await api.post<{
      success: boolean;
      data: CoachProfileData[];
      pagination: {
        limit: number;
        lastCoachId: string | null;
        hasNext: boolean;
      };
    }>("/v1/coaches/search", cleaned);

    return response.data;
  },

  // Coach Slot APIs

  createSlot: async (data: CreateCoachSlotInput) => {
    const cleaned = cleanObject(data);

    const response = await api.post<{
      success: boolean;
      data: CoachSlotData;
    }>("/v1/coach/slots", cleaned);

    return response.data;
  },

  getMySlots: async (date?: string, lastStartEpoch?: number) => {
    const params = new URLSearchParams();

    if (date && date.trim() !== "") {
      params.set("date", date.trim());
    }

    if (lastStartEpoch !== undefined) {
      params.set("lastStartEpoch", String(lastStartEpoch));
    }

    const query = params.toString();

    const response = await api.get<{
      success: boolean;
      data: CoachSlotData[];
      pagination: CoachSlotPagination;
    }>(query ? `/v1/coach/slots?${query}` : "/v1/coach/slots");

    return response.data;
  },

  cancelSlot: async (slotId: string) => {
    const response = await api.delete<{
      success: boolean;
      data: CoachSlotData;
    }>(`/v1/coach/slots/${slotId}`);

    return response.data;
  },

  getPublicSlots: async (
    coachId: string,
    date: string,
    lastStartEpoch?: number,
  ) => {
    const params = new URLSearchParams();

    params.set("date", date);

    if (lastStartEpoch !== undefined) {
      params.set("lastStartEpoch", String(lastStartEpoch));
    }

    const response = await api.get<{
      success: boolean;
      data: CoachSlotData[];
      pagination: CoachSlotPagination;
    }>(`/v1/coaches/${coachId}/slots?${params.toString()}`);

    return response.data;
  },

  // Session Request APIs

  createSessionRequest: async (slotId: string) => {
    const response = await api.post<{
      success: boolean;
      data: SessionRequestItem;
    }>(`/v1/slots/${slotId}/requests`);

    return response.data;
  },

  getUserSessionRequests: async (lastRequestId?: string) => {
    let url = "/v1/user/session-requests";

    if (lastRequestId && lastRequestId.trim() !== "") {
      url += `?lastRequestId=${encodeURIComponent(lastRequestId.trim())}`;
    }

    const response = await api.get<{
      success: boolean;
      data: SessionRequestItem[];
      pagination: {
        limit: number;
        lastRequestId: string | null;
        hasNext: boolean;
      };
    }>(url);

    return response.data;
  },

  getCoachSessionRequests: async (
    status?: string,
    lastRequestId?: string,
  ) => {
    const params = new URLSearchParams();
    if (status && status !== "all") {
      params.set("status", status.trim());
    }
    if (lastRequestId && lastRequestId.trim() !== "") {
      params.set("lastRequestId", lastRequestId.trim());
    }
    const query = params.toString();
    const url = query ? `/v1/coach/session-requests?${query}` : "/v1/coach/session-requests";

    const response = await api.get<{
      success: boolean;
      data: SessionRequestItem[];
      pagination: {
        limit: number;
        lastRequestId: string | null;
        hasNext: boolean;
      };
    }>(url);

    return response.data;
  },

  updateSessionRequestStatus: async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    const response = await api.patch<{
      success: boolean;
      data: any;
    }>(`/v1/coach/session-requests/${requestId}`, { status });

    return response.data;
  },
};
