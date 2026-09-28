import api from "../../../utils/api";
import { cleanObject } from "../../../utils/cleanObject";
import type { VenueSlotData } from "../../venue-owner/api/venueOwner.api";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5000";

export interface UserSummary {
  _id: string;
  firstName: string;
  lastName: string;
  joinedAt?: string;
  isHost?: boolean;
}

export interface GameVenueSummary {
  _id: string;
  name: string;
  images?: string[];
  location: {
    address: string;
    city: string;
  };
}

export interface GameSubvenue {
  _id: string;
  name: string;
  sport: string;
  images?: string[];
  venueId: GameVenueSummary;
}

export interface GameData {
  _id: string;
  creatorId: UserSummary;
  subvenueId: GameSubvenue;
  slotId: VenueSlotData;
  minimumPlayers: number;
  maximumPlayers: number;
  acceptedPlayerIds: UserSummary[];
  status: "forming" | "ready" | "booked" | "cancelled";
  bookingId?: string | { _id: string; status: string };
  createdAt: string;
  updatedAt: string;
}

export interface GameJoinRequestData {
  _id: string;
  gameId: string;
  userId: UserSummary;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

export interface CreateGameInput {
  subvenueId: string;
  slotId: string;
  minimumPlayers: number;
  maximumPlayers: number;
}

export interface GameSearchFilters {
  subvenueId?: string;
  subvenueName?: string;
  sport?: string;
  date?: string;
  status?: "forming" | "ready";
  minPlayers?: number;
  maxPlayers?: number;
  lastGameId?: string;
}

export interface GamePagination {
  limit: number;
  lastGameId: string | null;
  hasNext: boolean;
}

export const gameApi = {
  searchGames: async (filters: GameSearchFilters = {}) => {
    const cleaned = cleanObject(filters);
    const response = await api.post<{
      success: boolean;
      data: GameData[];
      pagination: GamePagination;
    }>("/v1/games/search", cleaned);
    return response.data;
  },

  getGame: async (gameId: string) => {
    const response = await api.get<{
      success: boolean;
      data: GameData;
    }>(`/v1/games/${gameId}`);
    return response.data;
  },

  subscribeToGame: (
    gameId: string,
    handlers: {
      onGameState: (game: GameData) => void;
      onGameReady: (game: GameData) => void;
      onJoinRequestCreated: () => void;
      onJoinRequestAccepted: (game?: GameData) => void;
      onJoinRequestRejected: () => void;
      onGameBooked: (game: GameData) => void;
      onGameCancelled: (game: GameData) => void;
    },
  ) => {
    const eventSource = new EventSource(
      `${CLIENT_URL}/v1/games/${gameId}/stream`,
      { withCredentials: true },
    );

    const readGame = (event: Event) => {
      const parsed = JSON.parse((event as MessageEvent).data) as {
        game?: GameData;
      };
      return parsed.game;
    };

    eventSource.addEventListener("game_state", (event) => {
      try {
        const game = readGame(event);
        if (game) handlers.onGameState(game);
      } catch (error) {
        console.error("SSE parse error:", error);
      }
    });

    eventSource.addEventListener("game_ready", (event) => {
      try {
        const game = readGame(event);
        if (game) handlers.onGameReady(game);
      } catch (error) {
        console.error(error);
      }
    });

    eventSource.addEventListener("join_request_created", () => {
      handlers.onJoinRequestCreated();
    });

    eventSource.addEventListener("join_request_accepted", (event) => {
      try {
        handlers.onJoinRequestAccepted(readGame(event));
      } catch (error) {
        console.error(error);
      }
    });

    eventSource.addEventListener("join_request_rejected", () => {
      handlers.onJoinRequestRejected();
    });

    eventSource.addEventListener("game_booked", (event) => {
      try {
        const game = readGame(event);
        if (game) handlers.onGameBooked(game);
      } catch (error) {
        console.error(error);
      }
    });

    eventSource.addEventListener("game_cancelled", (event) => {
      try {
        const game = readGame(event);
        if (game) handlers.onGameCancelled(game);
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      eventSource.close();
    };
  },

  createGame: async (data: CreateGameInput) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: GameData;
    }>("/v1/games", data);
    return response.data;
  },

  createJoinRequest: async (gameId: string) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: GameJoinRequestData;
    }>(`/v1/games/${gameId}/join-request`);
    return response.data;
  },

  getJoinRequests: async (gameId: string) => {
    const response = await api.get<{
      success: boolean;
      data: GameJoinRequestData[];
    }>(`/v1/games/${gameId}/join-requests`);
    return response.data;
  },

  updateJoinRequest: async (
    gameId: string,
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    const response = await api.patch<{
      success: boolean;
      data: { request: GameJoinRequestData; game: GameData };
    }>(`/v1/games/${gameId}/join-requests/${requestId}`, { status });
    return response.data;
  },

  bookGame: async (gameId: string) => {
    const response = await api.post<{
      success: boolean;
      data: { game: GameData; booking: unknown };
    }>(`/v1/games/${gameId}/book`);
    return response.data;
  },

  cancelGame: async (gameId: string) => {
    const response = await api.post<{
      success: boolean;
      data: GameData;
    }>(`/v1/games/${gameId}/cancel`);
    return response.data;
  },
};
