import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Building,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type VenueProfileData,
  type SubvenueData,
  type VenueSlotData,
} from "../api/venueOwner.api";
import VenueSlotCard from "../cards/VenueSlotCard";
import { useAuth } from "../../../context/AuthContext";

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState<VenueProfileData | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);

  const [subvenues, setSubvenues] = useState<SubvenueData[]>([]);
  const [selectedSubvenueId, setSelectedSubvenueId] = useState<string>("");

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slots, setSlots] = useState<VenueSlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  // Fetch venue details
  useEffect(() => {
    if (!venueId) {
      toast.error("Invalid venue ID");
      setLoadingVenue(false);
      return;
    }

    const fetchVenue = async () => {
      setLoadingVenue(true);
      try {
        const res = await venueOwnerApi.getVenue(venueId);
        if (res.success && res.data) {
          setVenue(res.data);
        } else {
          setVenue(null);
        }
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load venue details",
        );
        setVenue(null);
      } finally {
        setLoadingVenue(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  // Fetch subvenues when venue loads
  useEffect(() => {
    if (!venue || !venue._id) return;

    const fetchSubvenues = async () => {
      try {
        const res = await venueOwnerApi.getSubvenues(venue._id);
        if (res.success) {
          const list = res.data || [];
          setSubvenues(list);
          if (list.length > 0) {
            setSelectedSubvenueId(list[0]._id);
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load subvenues");
      }
    };

    fetchSubvenues();
  }, [venue]);

  // Fetch slots and subscribe to real-time SSE stream
  useEffect(() => {
    if (!selectedSubvenueId || !selectedDate) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    const fetchSlotsAndSSE = async () => {
      setLoadingSlots(true);

      try {
        const res = await venueOwnerApi.getSlots(
          selectedSubvenueId,
          selectedDate,
        );
        if (cancelled) return;

        if (res.success) {
          setSlots(res.data || []);
        }
      } catch (err: any) {
        if (cancelled) return;
        toast.error(
          err.response?.data?.message || "Failed to load slots for date",
        );
        setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }

      // Establish SSE stream
      try {
        const eventSource = venueOwnerApi.getSlotsStream(
          selectedSubvenueId,
          selectedDate,
        );

        eventSource.addEventListener("slots_state", (event) => {
          try {
            const parsed = JSON.parse(event.data) as {
              slots: VenueSlotData[];
            };
            if (parsed.slots) {
              setSlots(parsed.slots);
            }
          } catch (e) {
            console.error("Failed to parse slots_state event:", e);
          }
        });

        eventSource.addEventListener("slot_created", (event) => {
          try {
            const parsed = JSON.parse(event.data) as {
              slot: VenueSlotData;
            };
            const newSlot = parsed.slot;
            if (newSlot && newSlot.date === selectedDate) {
              setSlots((current) => {
                if (current.some((s) => s._id === newSlot._id)) return current;
                return [...current, newSlot].sort(
                  (a, b) => a.startEpoch - b.startEpoch,
                );
              });
            }
          } catch (e) {
            console.error("Failed to parse slot_created event:", e);
          }
        });

        eventSource.addEventListener("slot_booked", (event) => {
          try {
            const parsed = JSON.parse(event.data) as { slotId: string };
            setSlots((current) =>
              current.map((s) =>
                s._id === parsed.slotId ? { ...s, status: "booked" } : s,
              ),
            );
          } catch (e) {
            console.error("Failed to parse slot_booked event:", e);
          }
        });

        eventSource.addEventListener("slot_cancelled", (event) => {
          try {
            const parsed = JSON.parse(event.data) as { slotId: string };
            setSlots((current) =>
              current.filter((s) => s._id !== parsed.slotId),
            );
          } catch (e) {
            console.error("Failed to parse slot_cancelled event:", e);
          }
        });

        return () => {
          eventSource.close();
        };
      } catch (err) {
        console.error("SSE stream connection error:", err);
      }
    };

    const cleanupPromise = fetchSlotsAndSSE();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [selectedSubvenueId, selectedDate]);

  const handleBookingRequest = async (slotId: string) => {
    if (!user) {
      toast.info("Please login to request a court booking");
      navigate("/login");
      return;
    }

    if (user.role !== "player") {
      toast.error("Only players can book court slots");
      return;
    }

    setBookingSlotId(slotId);

    try {
      const res = await venueOwnerApi.createBookingRequest(
        selectedSubvenueId,
        slotId,
      );

      if (res.success) {
        toast.success(
          "Booking request sent successfully! The venue owner will review it shortly.",
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to send booking request",
      );
    } finally {
      setBookingSlotId(null);
    }
  };

  if (loadingVenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground font-medium">
            Loading venue details...
          </p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold">Venue Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The venue you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/venues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft size={14} />
            Browse Venues
          </Link>
        </div>
      </div>
    );
  }

  const location = [
    venue.location?.address,
    venue.location?.city,
    venue.location?.state,
    venue.location?.country,
    venue.location?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const selectedSubvenue = subvenues.find(
    (sv) => sv._id === selectedSubvenueId,
  );

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

        {/* Venue Profile Card */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shadow-inner shrink-0">
              {venue.images && venue.images.length > 0 ? (
                <img
                  src={venue.images[0]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building size={36} className="text-foreground/40" />
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {venue.name}
                </h1>

                {venue.sports && venue.sports.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                    <Trophy size={13} />
                    {venue.sports.length}{" "}
                    {venue.sports.length === 1 ? "sport" : "sports"}
                  </span>
                ) : null}
              </div>

              {location ? (
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={13} />
                  {location}
                </p>
              ) : null}

              {venue.sports && venue.sports.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {venue.sports.map((sport) => (
                    <span
                      key={sport}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border pt-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              About This Venue
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Facilities */}
          {venue.facilities && venue.facilities.length > 0 && (
            <div className="border-t border-border pt-5 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Facilities
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {venue.facilities.map((facility) => (
                  <span
                    key={facility}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Available Slots Section */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Available Time Slots
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose court and date to book a playing session
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto min-w-0">
              {subvenues.length > 0 && (
                <div className="w-full sm:w-auto min-w-0 max-w-full overflow-hidden">
                  <select
                    value={selectedSubvenueId}
                    onChange={(e) => setSelectedSubvenueId(e.target.value)}
                    className="w-full sm:w-auto min-w-0 max-w-full px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 transition truncate"
                  >
                    {subvenues.map((sv) => (
                      <option key={sv._id} value={sv._id}>
                        {sv.name} ({sv.sport})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-input bg-background shrink-0">
                <Calendar size={14} className="text-muted-foreground" />

                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Subvenue details info */}
          {selectedSubvenue ? (
            <div className="bg-muted/40 rounded-2xl p-4 border border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground wrap-anywhere">
                  {selectedSubvenue.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 wrap-anywhere">
                  Sport: {selectedSubvenue.sport} •{" "}
                  {selectedSubvenue.description}
                </p>
              </div>
            </div>
          ) : null}

          {/* Slots List */}
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
          ) : !selectedSubvenueId ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                This venue has not set up any subvenues yet.
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
                No slots are scheduled for this date. Please pick a different
                date or subvenue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {slots.map((slot) => (
                <VenueSlotCard
                  key={slot._id}
                  slot={slot}
                  isVenueView={false}
                  isActionLoading={bookingSlotId === slot._id}
                  onRequestBooking={handleBookingRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
