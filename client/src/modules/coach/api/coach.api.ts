import api from "../../../lib/api";
import { cleanObject } from "../../../utils/cleanObject";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export interface CoachingCenter {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
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
  userId: { _id: string; firstName: string; lastName: string };
  coachId: { _id: string; firstName: string; lastName: string };
  slotId: CoachSlotData;
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

  subscribeToPublicSlots: (
    coachId: string,
    date: string,
    setSlots: (getNextSlots: (current: CoachSlotData[]) => CoachSlotData[]) => void,
  ) => {
    const params = new URLSearchParams({ date });
    const eventSource = new EventSource(
      `${SERVER_URL}/v1/coaches/${coachId}/slots/events?${params.toString()}`,
      { withCredentials: true },
    );

    const onState = (event: Event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent).data) as {
          slots: CoachSlotData[];
        };
        const incomingSlots = parsed.slots || [];

        setSlots((currentSlots) => {
          const incomingMap = new Map(
            incomingSlots.map((slot) => [slot._id, slot]),
          );

          return currentSlots
            .filter((slot) => incomingMap.has(slot._id))
            .map((slot) => incomingMap.get(slot._id) || slot);
        });
      } catch (error) {
        console.error("Failed to parse slots_state event:", error);
      }
    };

    const onCreated = (event: Event) => {
      let parsed: { slot: CoachSlotData };
      try {
        parsed = JSON.parse((event as MessageEvent).data);
      } catch (error) {
        console.error("Failed to parse slot_created event:", error);
        return;
      }

      const newSlot = parsed.slot;
      if (!newSlot || newSlot.date !== date || newSlot.status !== "available") {
        return;
      }

      setSlots((currentSlots) => {
        const alreadyExists = currentSlots.some(
          (slot) => slot._id === newSlot._id,
        );
        if (alreadyExists) {
          return currentSlots;
        }

        const nextSlots = [...currentSlots, newSlot];
        nextSlots.sort((a, b) => a.startEpoch - b.startEpoch);
        return nextSlots;
      });
    };

    const onRemoved = (event: Event, label: string) => {
      let parsed: { slotId: string };
      try {
        parsed = JSON.parse((event as MessageEvent).data);
      } catch (error) {
        console.error(`Failed to parse ${label} event:`, error);
        return;
      }

      setSlots((currentSlots) =>
        currentSlots.filter((slot) => slot._id !== parsed.slotId),
      );
    };

    eventSource.addEventListener("slots_state", onState);
    eventSource.addEventListener("slot_created", onCreated);
    eventSource.addEventListener("slot_available", onCreated);
    eventSource.addEventListener("slot_booked", (event) =>
      onRemoved(event, "slot_booked"),
    );
    eventSource.addEventListener("slot_cancelled", (event) =>
      onRemoved(event, "slot_cancelled"),
    );

    eventSource.onerror = (error) => {
      console.error("Coach slot SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  },

  // Session Request APIs

  createSessionRequest: async (slotId: string) => {
    const response = await api.post<{
      success: boolean;
      data: SessionRequestItem;
    }>(`/v1/slots/${slotId}/requests`);

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
