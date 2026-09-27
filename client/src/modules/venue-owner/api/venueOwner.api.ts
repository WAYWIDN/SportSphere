import api from "../../../utils/api";
import { cleanObject } from "../../../utils/cleanObject";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5000";

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface VenueProfileData {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  location: Location;
  sports: string[];
  facilities: string[];
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubvenueData {
  _id: string;
  venueId: string;
  name: string;
  sport: string;
  description: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VenueSlotData {
  _id: string;
  subvenueId: string;
  date: string;
  startEpoch: number;
  endEpoch: number;
  price: number;
  status: "available" | "booked" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingRequestItem {
  _id: string;
  userId: string | { _id: string; email: string };
  venueOwnerId: string;
  subvenueId: string | SubvenueData;
  slotId: string | VenueSlotData;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

export interface CreateVenueProfileInput {
  name: string;
  description: string;
  location: Location;
  sports: string[];
  facilities?: string[];
  images?: string[];
}

export interface UpdateVenueProfileInput {
  name?: string;
  description?: string;
  location?: Partial<Location>;
  sports?: string[];
  facilities?: string[];
  images?: string[];
}

export interface CreateSubvenueInput {
  name: string;
  sport: string;
  description: string;
  images?: string[];
}

export interface UpdateSubvenueInput {
  name?: string;
  sport?: string;
  description?: string;
  images?: string[];
}

export interface CreateVenueSlotInput {
  subvenueId: string;
  date: string;
  startEpoch: number;
  endEpoch: number;
  price: number;
}

export interface VenueSearchFilters {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  sport?: string;
  facility?: string;
  lastVenueId?: string;
}

export interface VenuePagination {
  limit: number;
  lastVenueId: string | null;
  hasNext: boolean;
}

export interface BookingRequestPagination {
  limit: number;
  lastRequestId: string | null;
  hasNext: boolean;
}

export const venueOwnerApi = {
  // Venue Profile APIs
  getMyVenues: async () => {
    const response = await api.get<{
      success: boolean;
      data: VenueProfileData[];
    }>("/v1/venue-owner/venues");
    return response.data;
  },

  searchVenues: async (filters: VenueSearchFilters) => {
    const cleaned = cleanObject(filters);
    const response = await api.post<{
      success: boolean;
      data: VenueProfileData[];
      pagination: VenuePagination;
    }>("/v1/venues/search", cleaned);
    return response.data;
  },

  getVenue: async (venueId: string) => {
    const response = await api.get<{
      success: boolean;
      data: VenueProfileData;
    }>(`/v1/venues/${venueId}`);
    return response.data;
  },

  createVenue: async (data: CreateVenueProfileInput) => {
    const cleaned = cleanObject(data);
    const response = await api.post<{
      success: boolean;
      message: string;
      data: VenueProfileData;
    }>("/v1/venues", cleaned);
    return response.data;
  },

  updateVenue: async (venueId: string, data: UpdateVenueProfileInput) => {
    const cleaned = cleanObject(data);
    const response = await api.patch<{
      success: boolean;
      data: VenueProfileData;
    }>(`/v1/venues/${venueId}`, cleaned);
    return response.data;
  },

  deleteVenue: async (venueId: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/v1/venues/${venueId}`);
    return response.data;
  },

  // Subvenue APIs
  getSubvenues: async (venueId: string) => {
    const response = await api.get<{
      success: boolean;
      data: SubvenueData[];
    }>(`/v1/venues/${venueId}/subvenues`);
    return response.data;
  },

  getSubvenue: async (subvenueId: string) => {
    const response = await api.get<{
      success: boolean;
      data: SubvenueData;
    }>(`/v1/subvenues/${subvenueId}`);
    return response.data;
  },

  createSubvenue: async (venueId: string, data: CreateSubvenueInput) => {
    const cleaned = cleanObject(data);
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SubvenueData;
    }>(`/v1/venues/${venueId}/subvenues`, cleaned);
    return response.data;
  },

  updateSubvenue: async (subvenueId: string, data: UpdateSubvenueInput) => {
    const cleaned = cleanObject(data);
    const response = await api.patch<{
      success: boolean;
      data: SubvenueData;
    }>(`/v1/subvenues/${subvenueId}`, cleaned);
    return response.data;
  },

  deleteSubvenue: async (subvenueId: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/v1/subvenues/${subvenueId}`);
    return response.data;
  },

  // Slot APIs
  getSlots: async (subvenueId: string, date: string) => {
    const params = new URLSearchParams();
    if (date && date.trim() !== "") {
      params.set("date", date.trim());
    }
    const query = params.toString();
    const response = await api.get<{
      success: boolean;
      data: VenueSlotData[];
    }>(query ? `/v1/subvenues/${subvenueId}/slots?${query}` : `/v1/subvenues/${subvenueId}/slots`);
    return response.data;
  },

  createSlot: async (subvenueId: string, data: CreateVenueSlotInput) => {
    const cleaned = cleanObject(data);
    const response = await api.post<{
      success: boolean;
      message: string;
      data: VenueSlotData;
    }>(`/v1/subvenues/${subvenueId}/slots`, cleaned);
    return response.data;
  },

  deleteSlot: async (slotId: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/v1/slots/${slotId}`);
    return response.data;
  },

  getSlotsStream: (subvenueId: string, date: string): EventSource => {
    const params = new URLSearchParams({ date });
    return new EventSource(
      `${CLIENT_URL}/v1/subvenues/${subvenueId}/slots/stream?${params.toString()}`,
      { withCredentials: true }
    );
  },

  // Booking Request APIs
  createBookingRequest: async (subvenueId: string, slotId: string) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: BookingRequestItem;
    }>(`/v1/subvenues/${subvenueId}/slots/${slotId}/booking-requests`);
    return response.data;
  },

  getMyBookingRequests: async (status?: string, lastRequestId?: string) => {
    const params = new URLSearchParams();
    if (status && status !== "all") {
      params.set("status", status.trim());
    }
    if (lastRequestId && lastRequestId.trim() !== "") {
      params.set("lastRequestId", lastRequestId.trim());
    }
    const query = params.toString();
    const url = query ? `/v1/venue-owner/booking-requests?${query}` : "/v1/venue-owner/booking-requests";

    const response = await api.get<{
      success: boolean;
      data: BookingRequestItem[];
      pagination: BookingRequestPagination;
    }>(url);
    return response.data;
  },

  updateBookingRequestStatus: async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    const response = await api.patch<{
      success: boolean;
      data: { request: BookingRequestItem; booking?: unknown };
    }>(`/v1/venue-owner/booking-requests/${requestId}`, { status });
    return response.data;
  },
};