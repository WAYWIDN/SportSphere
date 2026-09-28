import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Loader2,
  RefreshCw,
  Inbox,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import PageButtons from "../../../components/ui/PageButtons";
import { sessionApi, type BookingItem } from "../api/session.api";
import { coachApi, type SessionRequestItem } from "../../coach/api/coach.api";
import { formatTimeEpoch } from "../../../utils/formatTime";
import { useAuth } from "../../../context/AuthContext";
import { formatUserName } from "../../../utils/formatUserName";

type TabKey = "coach" | "venue";

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  approved: {
    label: "Approved",
    className: "bg-primary text-primary-foreground",
    icon: <CheckCircle2 size={11} />,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-primary text-primary-foreground",
    icon: <CheckCircle2 size={11} />,
  },
  pending: {
    label: "Pending",
    className: "bg-muted text-foreground border border-border",
    icon: <AlertCircle size={11} />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-muted text-muted-foreground border border-border",
    icon: <XCircle size={11} />,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border border-border",
    icon: <XCircle size={11} />,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    icon: <CheckCircle2 size={11} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${badge.className}`}
    >
      {badge.icon}
      {badge.label}
    </span>
  );
}

function CoachSessionCard({ request }: { request: SessionRequestItem }) {
  const slot = request.slotId;

  const coachName = formatUserName(request.coachId, "Coach");

  return (
    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <User size={14} className="text-muted-foreground" />
          {coachName}
        </div>
        <StatusBadge status={request.status} />
      </div>

      {slot && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground/80">
            <Calendar size={13} />
            {slot.date}
          </span>
          <span className="flex items-center gap-1 font-medium text-foreground/80">
            <Clock size={13} />
            {formatTimeEpoch(slot.startEpoch)} – {formatTimeEpoch(slot.endEpoch)}
          </span>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Requested: {new Date(request.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function VenueBookingCard({ booking }: { booking: BookingItem }) {
  return (
    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Building2 size={14} className="text-muted-foreground" />
          Venue Booking
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground/80">
          <Clock size={13} />
          {formatTimeEpoch(booking.startEpoch)} – {formatTimeEpoch(booking.endEpoch)}
        </span>
        <span className="flex items-center gap-1 font-medium text-foreground/80 font-mono">
          <IndianRupee size={12} className="text-primary" />
          Booking confirmed
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Booked: {new Date(booking.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("coach");

  const [coachSessions, setCoachSessions] = useState<SessionRequestItem[]>([]);
  const [coachLoading, setCoachLoading] = useState(true);
  const [coachLoadingPage, setCoachLoadingPage] = useState(false);
  const [coachPage, setCoachPage] = useState(1);
  const [coachCursorHistory, setCoachCursorHistory] = useState<
    (string | undefined)[]
  >([undefined]);
  const [coachNextCursor, setCoachNextCursor] = useState<string | null>(null);
  const [coachHasNext, setCoachHasNext] = useState(false);

  const [venueSessions, setVenueSessions] = useState<BookingItem[]>([]);
  const [venueLoading, setVenueLoading] = useState(true);
  const [venueLoadingPage, setVenueLoadingPage] = useState(false);
  const [venuePage, setVenuePage] = useState(1);
  const [venueCursorHistory, setVenueCursorHistory] = useState<
    (string | undefined)[]
  >([undefined]);
  const [venueNextCursor, setVenueNextCursor] = useState<string | null>(null);
  const [venueHasNext, setVenueHasNext] = useState(false);

  const fetchCoachSessions = async (cursor?: string) => {
    setCoachLoading(true);
    if (cursor === undefined) {
      setCoachPage(1);
      setCoachCursorHistory([undefined]);
    }
    try {
      const res = await coachApi.getUserSessionRequests(cursor);
      if (res.success) {
        setCoachSessions(res.data);
        setCoachNextCursor(res.pagination.lastRequestId);
        setCoachHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load coaching sessions");
    } finally {
      setCoachLoading(false);
    }
  };

  const loadCoachPage = async (cursor: string | undefined, page: number) => {
    setCoachPage(page);
    setCoachLoadingPage(true);
    try {
      const res = await coachApi.getUserSessionRequests(cursor);
      if (res.success) {
        setCoachSessions(res.data);
        setCoachNextCursor(res.pagination.lastRequestId);
        setCoachHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load coaching sessions");
    } finally {
      setCoachLoadingPage(false);
    }
  };

  const handleNextCoachPage = async () => {
    if (!coachHasNext || !coachNextCursor || coachLoadingPage) return;
    const newPage = coachPage + 1;
    const updatedHistory = [...coachCursorHistory];
    updatedHistory[newPage - 1] = coachNextCursor;
    setCoachCursorHistory(updatedHistory);
    await loadCoachPage(coachNextCursor, newPage);
  };

  const handlePrevCoachPage = async () => {
    if (coachPage <= 1 || coachLoadingPage) return;
    const prevPage = coachPage - 1;
    await loadCoachPage(coachCursorHistory[prevPage - 1], prevPage);
  };

  const fetchVenueSessions = async (cursor?: string) => {
    setVenueLoading(true);
    if (cursor === undefined) {
      setVenuePage(1);
      setVenueCursorHistory([undefined]);
    }
    try {
      const res = await sessionApi.getVenueBookings(cursor);
      if (res.success) {
        const venueOnly = res.data.filter((booking) => booking.providerType === "venue");
        setVenueSessions(venueOnly);
        setVenueNextCursor(res.pagination.lastBookingId);
        setVenueHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load venue bookings");
    } finally {
      setVenueLoading(false);
    }
  };

  const loadVenuePage = async (cursor: string | undefined, page: number) => {
    setVenuePage(page);
    setVenueLoadingPage(true);
    try {
      const res = await sessionApi.getVenueBookings(cursor);
      if (res.success) {
        const venueOnly = res.data.filter((booking) => booking.providerType === "venue");
        setVenueSessions(venueOnly);
        setVenueNextCursor(res.pagination.lastBookingId);
        setVenueHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load venue bookings");
    } finally {
      setVenueLoadingPage(false);
    }
  };

  const handleNextVenuePage = async () => {
    if (!venueHasNext || !venueNextCursor || venueLoadingPage) return;
    const newPage = venuePage + 1;
    const updatedHistory = [...venueCursorHistory];
    updatedHistory[newPage - 1] = venueNextCursor;
    setVenueCursorHistory(updatedHistory);
    await loadVenuePage(venueNextCursor, newPage);
  };

  const handlePrevVenuePage = async () => {
    if (venuePage <= 1 || venueLoadingPage) return;
    const prevPage = venuePage - 1;
    await loadVenuePage(venueCursorHistory[prevPage - 1], prevPage);
  };

  useEffect(() => {
    fetchCoachSessions();
    fetchVenueSessions();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <h2 className="text-xl font-bold">Please Log In</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to view your sessions and bookings.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>  </div>
          <button
            type="button"
            onClick={() => {
              fetchCoachSessions();
              fetchVenueSessions();
            }}
            disabled={coachLoading || venueLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer w-fit"
          >
            <RefreshCw
              size={12}
              className={coachLoading || venueLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-2xl p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("coach")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${activeTab === "coach"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Briefcase size={14} />
            Coach Sessions
            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
              {coachSessions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("venue")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${activeTab === "venue"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Building2 size={14} />
            Venue Bookings
            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
              {venueSessions.length}
            </span>
          </button>
        </div>

        {/* Coach Sessions Tab */}
        {activeTab === "coach" && (
          <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight">Coach Sessions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your coaching session requests - pending, approved, and past sessions
              </p>
            </div>

            {coachLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
                <p className="text-xs text-muted-foreground">Loading sessions...</p>
              </div>
            ) : coachSessions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Inbox size={22} />
                </div>
                <h3 className="text-sm font-bold">No Coach Sessions Yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  You haven't requested any coaching sessions. Discover coaches and book a slot!
                </p>
                <Link
                  to="/coaches"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm mt-2"
                >
                  Browse Coaches
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {coachSessions.map((session) => (
                    <CoachSessionCard key={session._id} request={session} />
                  ))}
                </div>

                <PageButtons
                  currentPage={coachPage}
                  hasNext={coachHasNext}
                  loading={coachLoadingPage}
                  onPrevious={handlePrevCoachPage}
                  onNext={handleNextCoachPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Venue Sessions Tab */}
        {activeTab === "venue" && (
          <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight">Venue Bookings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your confirmed venue slot bookings
              </p>
            </div>

            {venueLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
                <p className="text-xs text-muted-foreground">Loading bookings...</p>
              </div>
            ) : venueSessions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Inbox size={22} />
                </div>
                <h3 className="text-sm font-bold">No Venue Bookings Yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  No confirmed venue bookings yet. Explore venues and book a court slot!
                </p>
                <Link
                  to="/venues"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm mt-2"
                >
                  Browse Venues
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {venueSessions.map((booking) => (
                    <VenueBookingCard key={booking._id} booking={booking} />
                  ))}
                </div>

                <PageButtons
                  currentPage={venuePage}
                  hasNext={venueHasNext}
                  loading={venueLoadingPage}
                  onPrevious={handlePrevVenuePage}
                  onNext={handleNextVenuePage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
