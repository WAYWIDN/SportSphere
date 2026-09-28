import api from "../../../utils/api";

export interface BookingItem {
  _id: string;
  userId: string;
  providerId: string;
  providerType: "coach" | "venue";
  resourceId: string;
  sourceRequestId?: string;
  sourceGameId?: string;
  sourceVenueRequestId?: string;
  startEpoch: number;
  endEpoch: number;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export const sessionApi = {
  getVenueBookings: async (lastBookingId?: string) => {
    const params = new URLSearchParams();
    if (lastBookingId) params.set("lastBookingId", lastBookingId);
    const query = params.toString();
    const url = query
      ? `/v1/user/bookings?${query}`
      : "/v1/user/bookings";
    const response = await api.get<{
      success: boolean;
      data: BookingItem[];
      pagination: { limit: number; lastBookingId: string | null; hasNext: boolean };
    }>(url);
    return response.data;
  },
};
