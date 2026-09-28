import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Users,
  Trophy,
  Calendar,
  Clock,
  IndianRupee,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  gameApi,
  type GameData,
  type GameJoinRequestData,
} from "../api/game.api";
import GameJoinRequestCard from "../cards/GameJoinRequestCard";
import { formatTimeEpoch } from "../../../utils/formatTime";
import { useAuth } from "../../../context/AuthContext";
import { formatUserName } from "../../../utils/formatUserName";

export default function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);

  // Host Join Requests state
  const [joinRequests, setJoinRequests] = useState<GameJoinRequestData[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Actions
  const [joining, setJoining] = useState(false);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);


  // 1. Fetch game details
  const fetchGameDetails = async () => {
    if (!gameId) return;
    try {
      const res = await gameApi.getGame(gameId);
      if (res.success && res.data) {
        setGame(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load game details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchGameDetails();
  }, [gameId]);

  const isHost = Boolean(user && game && game.creatorId._id === user.id);

  const isAcceptedPlayer = Boolean(
    user &&
    game &&
    game.acceptedPlayerIds.some((player) => player._id === user.id)
  );

  // 2. Fetch join requests if user is host
  const fetchJoinRequests = async () => {
    if (!gameId || !isHost) return;
    setLoadingRequests(true);
    try {
      const res = await gameApi.getJoinRequests(gameId);
      if (res.success) {
        setJoinRequests(res.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isHost && gameId) {
      fetchJoinRequests();
    }
  }, [isHost, gameId]);

  // 3. Subscribe to real-time SSE stream if participant
  useEffect(() => {
    if (!gameId || !user) return;
    if (!isHost && !isAcceptedPlayer) return;

    try {
      return gameApi.subscribeToGame(gameId, {
        onGameState: (game) => setGame(game),
        onGameReady: (game) => {
          setGame(game);
          toast.info("Game has reached minimum player requirement!");
        },
        onJoinRequestCreated: () => {
          if (isHost) {
            fetchJoinRequests();
            toast.info("A new player has requested to join this game!");
          }
        },
        onJoinRequestAccepted: (game) => {
          if (game) setGame(game);
          if (isHost) fetchJoinRequests();
        },
        onJoinRequestRejected: () => {
          if (isHost) fetchJoinRequests();
        },
        onGameBooked: (game) => {
          setGame(game);
          toast.success("This game slot has been booked with the venue owner!");
        },
        onGameCancelled: (game) => {
          setGame(game);
          toast.warn("This game was cancelled by the host");
        },
      });
    } catch (err) {
      console.error("SSE Stream error:", err);
    }
  }, [gameId, user, isHost, isAcceptedPlayer]);

  // Handle Player Request to Join
  const handleJoinRequest = async () => {
    if (!user) {
      toast.info("Please login to request to join this game");
      navigate("/login");
      return;
    }

    if (user.role !== "player") {
      toast.error("Only player accounts can join games");
      return;
    }

    if (!gameId) return;
    setJoining(true);

    try {
      const res = await gameApi.createJoinRequest(gameId);
      if (res.success) {
        toast.success(
          "Join request sent to the host! You will be added once approved."
        );
        setHasRequested(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send join request");
    } finally {
      setJoining(false);
    }
  };

  // Handle Host Accept/Reject Join Request
  const handleUpdateRequest = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    if (!gameId) return;
    setProcessingRequestId(requestId);

    try {
      const res = await gameApi.updateJoinRequest(gameId, requestId, status);
      if (res.success) {
        toast.success(`Request ${status} successfully!`);
        if (res.data?.game) {
          setGame(res.data.game);
        }
        fetchJoinRequests();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to ${status} request`
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle Host Book Game Slot
  const handleBookGame = async () => {
    if (!gameId) return;
    setBooking(true);

    try {
      const res = await gameApi.bookGame(gameId);
      if (res.success) {
        toast.success(
          "Game successfully booked! The venue slot is now confirmed."
        );
        if (res.data?.game) {
          setGame(res.data.game);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to book game slot");
    } finally {
      setBooking(false);
    }
  };

  // Handle Host Cancel Game
  const handleCancelGame = async () => {
    if (!confirm("Are you sure you want to cancel this game?")) return;
    if (!gameId) return;
    setCancelling(true);

    try {
      const res = await gameApi.cancelGame(gameId);
      if (res.success) {
        toast.info("Game cancelled");
        if (res.data) {
          setGame(res.data);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel game");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground font-medium">
            Loading game details...
          </p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold">Game Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The game match you are looking for does not exist or has been cancelled.
          </p>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft size={14} />
            Browse Community Games
          </Link>
        </div>
      </div>
    );
  }

  const subvenue = game.subvenueId;
  const venue = subvenue.venueId;
  const slot = game.slotId;

  const sport = subvenue.sport || "Sport";
  const subvenueName = subvenue.name || "Court Match";
  const venueName = venue.name || "";
  let venueLocation = "";
  if (venue.location && venue.location.city) {
    venueLocation = venue.location.city;
    if (venue.location.address) {
      venueLocation = `${venue.location.city} • ${venue.location.address}`;
    }
  }

  const slotDate = slot.date || "";
  const startTime = slot.startEpoch ? formatTimeEpoch(slot.startEpoch) : "";
  const endTime = slot.endEpoch ? formatTimeEpoch(slot.endEpoch) : "";
  const price = slot.price ?? 0;

  const playerCount = game.acceptedPlayerIds.length;
  const minPlayers = game.minimumPlayers;
  const maxPlayers = game.maximumPlayers;
  const progressPercent = Math.min(
    100,
    Math.round((playerCount / maxPlayers) * 100)
  );
  const minReached = playerCount >= minPlayers;

  const hostName = formatUserName(game.creatorId, "Host Player");

  const pendingRequests = joinRequests.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation back and header actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/games")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer bg-card shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Games
          </button>

          <div className="flex items-center gap-2">
            {isHost && game.status === "ready" && (
              <button
                type="button"
                disabled={booking}
                onClick={handleBookGame}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {booking ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Booking Slot...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Book Game Slot
                  </>
                )}
              </button>
            )}

            {isHost && game.status !== "cancelled" && (
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelGame}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/10 transition cursor-pointer"
              >
                {cancelling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <XCircle size={13} />
                )}
                Cancel Game
              </button>
            )}
          </div>
        </div>

        {/* 1. Main Game Header Overview */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-border pb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                  <Trophy size={13} />
                  {sport}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    game.status === "ready"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : game.status === "booked"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : game.status === "cancelled"
                          ? "bg-muted text-muted-foreground border border-border line-through"
                          : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {game.status === "ready" ? "Ready to Book" : game.status}
                </span>

                {isHost && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                    You are the Host
                  </span>
                )}
                {!isHost && isAcceptedPlayer && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    You're in this game
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {subvenueName}
                </h1>
                {venueName && (
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    at <span className="text-foreground font-semibold">{venueName}</span>
                    {venueLocation ? ` • ${venueLocation}` : ""}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                Organized by{" "}
                <span className="text-foreground font-semibold">
                  {hostName}
                </span>
              </p>
            </div>

            {/* Price badge */}
            <div className="p-4 rounded-3xl bg-muted/40 border border-border text-right shrink-0">
              <p className="text-[11px] text-muted-foreground font-medium">
                Slot Price
              </p>
              <p className="text-2xl font-bold text-foreground flex items-center justify-end">
                <IndianRupee size={20} className="text-primary -mr-1" />
                {price}
              </p>
            </div>
          </div>

          {/* Schedule & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Date
                </p>
                <p className="text-sm font-bold text-foreground">
                  {slotDate || "Date to be scheduled"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Time Slot
                </p>
                <p className="text-sm font-bold text-foreground">
                  {startTime && endTime ? `${startTime} - ${endTime}` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity Progress */}
          <div className="p-5 rounded-3xl bg-background/50 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Users size={14} /> Player Roster Progress
              </span>
              <span className="font-bold text-foreground text-sm">
                {playerCount} / {maxPlayers}{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (Min: {minPlayers})
                </span>
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  minReached ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {minReached
                ? "Minimum player milestone reached! Host can now confirm the booking."
                : `Need ${minPlayers - playerCount} more player(s) to reach minimum requirement.`}
            </p>
          </div>

          {isHost && game.status === "ready" && (
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Ready to Book with Venue Owner
                </p>
                <p className="text-xs text-muted-foreground">
                  You have {playerCount} accepted players (minimum required: {minPlayers}). Confirm and reserve this court slot.
                </p>
              </div>

              <button
                type="button"
                disabled={booking}
                onClick={handleBookGame}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
              >
                {booking ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Booking Slot...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Book Game Slot
                  </>
                )}
              </button>
            </div>
          )}

          {/* Player Join Request Action (for non-participants) */}
          {!isHost && !isAcceptedPlayer && game.status === "forming" && (
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Want to play in this match?</p>
                <p className="text-xs text-muted-foreground">
                  Request to join and the host will review your request.
                </p>
              </div>

              {hasRequested ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border">
                  <Clock size={14} /> Request Pending Host Approval
                </span>
              ) : (
                <button
                  type="button"
                  disabled={joining}
                  onClick={handleJoinRequest}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {joining ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      Request to Join Game
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Accepted Players Roster */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <UserCheck size={20} className="text-primary" />
              Accepted Players ({game.acceptedPlayerIds.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Athletes confirmed for this playing session with join times
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {game.acceptedPlayerIds.map((player, idx) => {
              const playerName = formatUserName(player, `Player ${idx + 1}`);
              const joinedAt = player.joinedAt || null;
              const isPlayerHost = player._id === game.creatorId._id;

              let joinLabel = "Confirmed";
              if (joinedAt) {
                const joinedDate = new Date(joinedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });
                const joinedTime = new Date(joinedAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                const joinRole = isPlayerHost ? "Host joined" : "Joined";
                joinLabel = `${joinRole} ${joinedDate}, ${joinedTime}`;
              }

              return (
                <div
                  key={player._id}
                  className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                      {playerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {playerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="shrink-0" />
                        {joinLabel}
                      </p>
                    </div>
                  </div>

                  {isPlayerHost && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shrink-0">
                      Host
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Host Section: Manage Join Requests */}
        {isHost && game.status === "forming" ? (
          <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Player Join Requests ({pendingRequests.length} pending)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review and approve athletes requesting to join your game
                </p>
              </div>

              <button
                type="button"
                onClick={fetchJoinRequests}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loadingRequests ? (
              <div className="py-8 text-center">
                <Loader2
                  className="animate-spin text-primary mx-auto mb-2"
                  size={24}
                />
                <p className="text-xs text-muted-foreground">
                  Loading requests...
                </p>
              </div>
            ) : joinRequests.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Users size={20} />
                </div>
                <p className="text-sm font-semibold">No join requests yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  When other players discover your game and ask to join, their
                  requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {joinRequests.map((req) => (
                  <GameJoinRequestCard
                    key={req._id}
                    request={req}
                    isActionLoading={processingRequestId === req._id}
                    onAccept={(reqId) => handleUpdateRequest(reqId, "accepted")}
                    onReject={(reqId) => handleUpdateRequest(reqId, "rejected")}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
