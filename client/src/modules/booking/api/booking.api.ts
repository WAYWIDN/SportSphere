import api from "../../../lib/api";
import type { SessionRequestItem } from "../../coach/api/coach.api";

export interface VenueBookingRequestItem {
  _id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  subvenueId:
    | string
    | {
        _id: string;
        name: string;
        sport: string;
        venueId?: string | { _id: string; name: string };
      };
  slotId:
    | string
    | {
        date: string;
        startEpoch: number;
        endEpoch: number;
        price: number;
      };
}

type BookingListResponse<T> = {
  success: boolean;
  data: T[];
  pagination: { limit: number; lastRequestId: string | null; hasNext: boolean };
};

export const bookingApi = {
  getBookings: async (type: "coach" | "venue", lastRequestId?: string) => {
    const params = new URLSearchParams({ type });
    if (lastRequestId) params.set("lastRequestId", lastRequestId);
    const response = await api.get<
      BookingListResponse<SessionRequestItem | VenueBookingRequestItem>
    >(`/v1/user/bookings?${params.toString()}`);
    return response.data;
  },
};
