import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  MapPin,
  Award,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  Building,
  User,
  AlertCircle,
} from "lucide-react";
import PageButtons from "../../../components/ui/PageButtons";
import { toast } from "react-toastify";
import {
  coachApi,
  type CoachProfileData,
  type CoachSlotData,
} from "../api/coach.api";
import CoachSlotCard from "../cards/CoachSlotCard";
import { useAuth } from "../../../context/AuthContext";

export default function CoachDetailPage() {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [coach, setCoach] = useState<CoachProfileData | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(true);

  // Slot states
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<CoachSlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(number | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNextSlots, setHasNextSlots] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) {
      toast.error("Invalid coach ID");
      setLoadingCoach(false);
      return;
    }

    const fetchCoach = async () => {
      setLoadingCoach(true);

      try {
        const res = await coachApi.getProfile(coachId);

        if (res.success && res.data) {
          setCoach(res.data);
        } else {
          setCoach(null);
        }
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load coach profile",
        );

        setCoach(null);
      } finally {
        setLoadingCoach(false);
      }
    };

    fetchCoach();
  }, [coachId]);

  useEffect(() => {
    if (!coachId || !selectedDate) {
      return;
    }

    let cancelled = false;

    const fetchSlots = async () => {
      setLoadingSlots(true);

      // Reset pagination
      setCurrentPage(1);
      setCursorHistory([undefined]);
      setNextCursor(null);
      setHasNextSlots(false);

      try {
        const res = await coachApi.getPublicSlots(coachId, selectedDate);

        if (cancelled) {
          return;
        }

        if (res.success) {
          setSlots(res.data || []);
          setNextCursor(res.pagination.lastStartEpoch);
          setHasNextSlots(res.pagination.hasNext);
        }
      } catch (err: any) {
        if (cancelled) {
          return;
        }

        toast.error(
          err.response?.data?.message ||
            "Failed to load slots for selected date",
        );

        setSlots([]);
        setNextCursor(null);
        setHasNextSlots(false);
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    };

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [coachId, selectedDate]);

  const onNextPage = async () => {
    if (!hasNextSlots || nextCursor === null || loadingPage || !coachId) {
      return;
    }

    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;
    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    setLoadingPage(true);

    try {
      const res = await coachApi.getPublicSlots(
        coachId,
        selectedDate,
        nextCursor,
      );

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load next page");
    } finally {
      setLoadingPage(false);
    }
  };

  const onPreviousPage = async () => {
    if (currentPage <= 1 || loadingPage || !coachId) {
      return;
    }

    const prevPage = currentPage - 1;
    const prevCursor = cursorHistory[prevPage - 1];
    setCurrentPage(prevPage);
    setLoadingPage(true);

    try {
      const res = await coachApi.getPublicSlots(
        coachId,
        selectedDate,
        prevCursor,
      );

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load previous page",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (!coachId || !selectedDate) {
      return;
    }
    return coachApi.subscribeToPublicSlots(coachId, selectedDate, setSlots);
  }, [coachId, selectedDate]);

  const handleBookSession = async (slotId: string) => {
    if (!user) {
      toast.info("Please login as a player to book a coaching session");

      navigate("/login");
      return;
    }

    if (user.role !== "player") {
      toast.error("Only player accounts can book coaching sessions");

      return;
    }

    setBookingSlotId(slotId);

    try {
      const res = await coachApi.createSessionRequest(slotId);

      if (res.success) {
        toast.success(
          "Session request submitted! Waiting for coach confirmation.",
        );

        if (coachId) {
          const currentCursor = cursorHistory[currentPage - 1];
          const updatedSlots = await coachApi.getPublicSlots(
            coachId,
            selectedDate,
            currentCursor,
          );

          if (updatedSlots.success) {
            setSlots(updatedSlots.data || []);
            setNextCursor(updatedSlots.pagination.lastStartEpoch);
            setHasNextSlots(updatedSlots.pagination.hasNext);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request session");
    } finally {
      setBookingSlotId(null);
    }
  };

  /* Loading coach*/
  if (loadingCoach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />

          <p className="text-sm text-muted-foreground font-medium">
            Loading coach profile...
          </p>
        </div>
      </div>
    );
  }

  /* Coach not found*/
  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle size={28} />
          </div>

          <h2 className="text-xl font-bold">Coach Not Found</h2>

          <p className="text-sm text-muted-foreground">
            The coach profile you are looking for does not exist or has been
            removed.
          </p>

          <Link
            to="/coach"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Coaches
          </Link>
        </div>
      </div>
    );
  }

  const centerName = coach.coachingCenter?.name || "Independent Coach";

  const location = [
    coach.coachingCenter?.address,
    coach.coachingCenter?.city,
    coach.coachingCenter?.state,
    coach.coachingCenter?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back navigation */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer bg-card shadow-sm"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* Coach Profile Card */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shadow-inner shrink-0">
              {coach.profilePictureUrl ? (
                <img
                  src={coach.profilePictureUrl}
                  alt={centerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-foreground/40" />
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {centerName}
                </h1>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                  <Award size={13} />
                  {coach.experience} {coach.experience === 1 ? "year" : "years"}{" "}
                  experience
                </span>
              </div>

              {location ? (
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={13} />
                  {location}
                </p>
              ) : null}

              {/* Sports */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {coach.sports.map((sport) => (
                  <span
                    key={sport}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="border-t border-border pt-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              About the Coach
            </h2>

            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {coach.bio}
            </p>
          </div>

          {/* Training Facility */}
          {coach.coachingCenter ? (
            <div className="border-t border-border pt-5 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Training Facility
              </h2>

              <div className="bg-muted/40 rounded-2xl p-4 border border-border flex items-start gap-3">
                <Building
                  size={18}
                  className="text-foreground/70 shrink-0 mt-0.5"
                />

                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold text-foreground">
                    {coach.coachingCenter.name}
                  </p>

                  <p className="text-muted-foreground">
                    {coach.coachingCenter.address}
                  </p>

                  <p className="text-muted-foreground">
                    {[
                      coach.coachingCenter.city,
                      coach.coachingCenter.state,
                      coach.coachingCenter.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Training Center Photos */}
        {coach.photos && coach.photos.length > 0 ? (
          <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Training Center Gallery
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Photos of the training center and facilities
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coach.photos.map((photo, index) => (
                <div
                  key={`photo-${index}`}
                  className="relative w-full h-56 rounded-2xl overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={photo}
                    alt={`Training center photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Available Slots */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Available Sessions
              </h2>

              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a date and select an available time slot to request
                coaching
              </p>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-foreground/70" />

              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-2xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition cursor-pointer"
              />
            </div>
          </div>

          {/* Slots Loading */}
          {loadingSlots ? (
            <div className="py-12 text-center">
              <Loader2
                className="animate-spin text-primary mx-auto mb-2"
                size={28}
              />

              <p className="text-xs text-muted-foreground">
                Checking available slots for {selectedDate}...
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Clock size={22} />
              </div>

              <h3 className="text-sm font-bold">
                No Open Slots on {selectedDate}
              </h3>

              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                The coach hasn't scheduled any open slots for this date. Please
                pick another date.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                {slots.map((slot) => (
                  <CoachSlotCard
                    key={slot._id}
                    slot={slot}
                    isCoachView={false}
                    isActionLoading={bookingSlotId === slot._id}
                    onRequestSession={handleBookSession}
                  />
                ))}
              </div>

              <PageButtons
                currentPage={currentPage}
                hasNext={hasNextSlots}
                loading={loadingPage}
                onPrevious={onPreviousPage}
                onNext={onNextPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
