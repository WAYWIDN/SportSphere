import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Calendar,
  Clock,
  Loader2,
  ArrowLeft,
  Trophy,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type SubvenueData,
  type VenueSlotData,
} from "../api/venueOwner.api";
import { useAuth } from "../../../context/AuthContext";
import VenueSlotCard from "../cards/VenueSlotCard";

export default function SubvenueDetailPage() {
  const { venueId, subvenueId } = useParams<{
    venueId: string;
    subvenueId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subvenue, setSubvenue] = useState<SubvenueData | null>(null);
  const [loadingSubvenue, setLoadingSubvenue] = useState(true);

  const [venue, setVenue] = useState<any>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slots, setSlots] = useState<VenueSlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  // Fetch subvenue details
  useEffect(() => {
    if (!subvenueId) {
      toast.error("Invalid subvenue ID");
      setLoadingSubvenue(false);
      return;
    }

    const fetchSubvenue = async () => {
      setLoadingSubvenue(true);
      try {
        const res = await venueOwnerApi.getSubvenue(subvenueId);
        if (res.success && res.data) {
          setSubvenue(res.data);
        } else {
          setSubvenue(null);
        }
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load subvenue",
        );
        setSubvenue(null);
      } finally {
        setLoadingSubvenue(false);
      }
    };

    fetchSubvenue();
  }, [subvenueId]);

  // Fetch venue details
  useEffect(() => {
    if (!venueId) return;

    const fetchVenue = async () => {
      try {
        const res = await venueOwnerApi.getVenue(venueId);
        if (res.success && res.data) {
          setVenue(res.data);
        }
      } catch {
        // ignore
      }
    };

    fetchVenue();
  }, [venueId]);

  // Fetch slots and subscribe to SSE
  useEffect(() => {
    if (!subvenueId || !selectedDate) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    const fetchSlotsAndSSE = async () => {
      setLoadingSlots(true);

      try {
        const res = await venueOwnerApi.getSlots(subvenueId, selectedDate);
        if (cancelled) return;
        if (res.success) {
          setSlots(res.data || []);
        }
      } catch (err: any) {
        if (cancelled) return;
        toast.error(
          err.response?.data?.message || "Failed to load slots",
        );
        setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }

      // SSE stream
      try {
        const eventSource = venueOwnerApi.getSlotsStream(
          subvenueId,
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
                if (current.some((s) => s._id === newSlot._id))
                  return current;
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
            const parsed = JSON.parse(event.data) as {
              slotId: string;
            };
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
            const parsed = JSON.parse(event.data) as {
              slotId: string;
            };
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
        console.error("SSE connection error:", err);
      }
    };

    const cleanupPromise = fetchSlotsAndSSE();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [subvenueId, selectedDate]);

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
        subvenueId!,
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

  if (loadingSubvenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground font-medium">
            Loading subvenue...
          </p>
        </div>
      </div>
    );
  }

  if (!subvenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold">Subvenue Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The subvenue you are looking for does not exist or has been
            removed.
          </p>
          <Link
            to={`/venues/${venueId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft size={14} />
            Back to Venue
          </Link>
        </div>
      </div>
    );
  }

  const location = venue
    ? [
        venue.location?.address,
        venue.location?.city,
        venue.location?.state,
        venue.location?.country,
        venue.location?.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

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
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Subvenue Profile Card */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shadow-inner shrink-0">
              {subvenue.images && subvenue.images.length > 0 ? (
                <img
                  src={subvenue.images[0]}
                  alt={subvenue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Trophy size={36} className="text-foreground/40" />
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {subvenue.name}
                </h1>
                {subvenue.sport ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                    <Trophy size={13} />
                    {subvenue.sport}
                  </span>
                ) : null}
              </div>

              {location ? (
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={13} /> {location}
                </p>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border pt-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              About This Court
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {subvenue.description}
            </p>
          </div>

          {/* Images Gallery */}
          {subvenue.images && subvenue.images.length > 1 ? (
            <div className="border-t border-border pt-5 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subvenue.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full h-40 rounded-2xl overflow-hidden border border-border bg-muted"
                  >
                    <img
                      src={image}
                      alt={`Court image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Available Slots Section */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Available Time Slots
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a date and book a session at {subvenue.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition cursor-pointer"
              />
            </div>
          </div>

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
                No slots are scheduled for {subvenue.name} on this date.
                Please pick a different date.
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
