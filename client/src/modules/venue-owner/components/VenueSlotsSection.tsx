import { useEffect, useState } from "react";
import {
  Calendar,
  Loader2,
  Building,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type VenueProfileData,
  type SubvenueData,
  type VenueSlotData,
} from "../api/venueOwner.api";
import VenueSlotCard from "../cards/VenueSlotCard";
import SubVenueForm from "./SubVenueForm";
import CreateVenueSlotForm from "./CreateVenueSlotForm";

export default function VenueSlotsSection() {
  const [venue, setVenue] = useState<VenueProfileData | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);

  const [subvenues, setSubvenues] = useState<SubvenueData[]>([]);
  const [loadingSubvenues, setLoadingSubvenues] = useState(false);
  const [selectedSubvenueId, setSelectedSubvenueId] = useState<string>("");
  const [showAddSubvenue, setShowAddSubvenue] = useState(false);
  const [editingSubvenue, setEditingSubvenue] = useState<SubvenueData | null>(null);
  const [deletingSubvenueId, setDeletingSubvenueId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slots, setSlots] = useState<VenueSlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);

  // Load owner venue first
  useEffect(() => {
    const loadVenue = async () => {
      setLoadingVenue(true);
      try {
        const res = await venueOwnerApi.getMyVenues();
        if (res.success && res.data && res.data.length > 0) {
          const v = res.data[0];
          setVenue(v);
          if (v._id) {
            fetchSubvenues(v._id);
          }
        } else {
          setVenue(null);
        }
      } catch {
        setVenue(null);
      } finally {
        setLoadingVenue(false);
      }
    };

    loadVenue();
  }, []);

  const fetchSubvenues = async (vId: string) => {
    setLoadingSubvenues(true);
    try {
      const res = await venueOwnerApi.getSubvenues(vId);
      if (res.success) {
        const list = res.data || [];
        setSubvenues(list);
        if (list.length > 0) {
          if (!selectedSubvenueId || !list.some((s) => s._id === selectedSubvenueId)) {
            setSelectedSubvenueId(list[0]._id);
          }
        } else {
          setSelectedSubvenueId("");
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load subvenues");
    } finally {
      setLoadingSubvenues(false);
    }
  };

  const fetchSlots = async (subvenueId: string, date: string) => {
    if (!subvenueId) return;
    setLoadingSlots(true);

    try {
      const res = await venueOwnerApi.getSlots(subvenueId, date);
      if (res.success) {
        setSlots(res.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load slots");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Live SSE connection & fetch for selected subvenue + date
  useEffect(() => {
    if (!selectedSubvenueId || !selectedDate) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    const initSlotsAndSSE = async () => {
      await fetchSlots(selectedSubvenueId, selectedDate);

      if (cancelled) return;

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
          } catch (error) {
            console.error("Failed to parse slots_state event:", error);
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
                if (current.some((s) => s._id === newSlot._id)) {
                  return current;
                }
                return [...current, newSlot].sort(
                  (a, b) => a.startEpoch - b.startEpoch,
                );
              });
            }
          } catch (error) {
            console.error("Failed to parse slot_created event:", error);
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
          } catch (error) {
            console.error("Failed to parse slot_booked event:", error);
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
          } catch (error) {
            console.error("Failed to parse slot_cancelled event:", error);
          }
        });

        return () => {
          eventSource.close();
        };
      } catch (e) {
        console.error("SSE connection error:", e);
      }
    };

    const cleanupPromise = initSlotsAndSSE();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [selectedSubvenueId, selectedDate]);

  const handleCancelSlot = async (slotId: string) => {
    setCancellingSlotId(slotId);
    try {
      const res = await venueOwnerApi.deleteSlot(slotId);
      if (res.success) {
        toast.info("Slot deleted");
        setSlots((current) => current.filter((s) => s._id !== slotId));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete slot");
    } finally {
      setCancellingSlotId(null);
    }
  };

  const handleDeleteSubvenue = async (subvenueId: string) => {
    if (!confirm("Are you sure you want to delete this subvenue and all its slots?")) {
      return;
    }

    setDeletingSubvenueId(subvenueId);
    try {
      const res = await venueOwnerApi.deleteSubvenue(subvenueId);
      if (res.success) {
        toast.success("Subvenue deleted successfully");
        if (venue?._id) {
          await fetchSubvenues(venue._id);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete subvenue");
    } finally {
      setDeletingSubvenueId(null);
    }
  };

  if (loadingVenue) {
    return (
      <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
        <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
        <p className="text-xs text-muted-foreground">Loading venue schedule...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="bg-card rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-border text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Building size={32} />
        </div>
        <h2 className="text-xl font-bold">Venue Profile Required</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Please set up your venue profile in the Venue Profile tab before managing subvenues and slots.
        </p>
      </div>
    );
  }

  const selectedSubvenue = subvenues.find((sv) => sv._id === selectedSubvenueId);

  return (
    <div className="space-y-8">
      {/* 1. Subvenue Selection & Creation */}
      <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              1. Choose Subvenue / Court
            </h2>
            <p className="text-xs text-muted-foreground">
              Select which playing area you want to manage or add a new one
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSubvenue(!showAddSubvenue)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            {showAddSubvenue ? "Close Subvenue Form" : "Add New Subvenue"}
          </button>
        </div>

        {showAddSubvenue ? (
          <SubVenueForm
            venueId={venue._id}
            onSaved={() => {
              setShowAddSubvenue(false);
              fetchSubvenues(venue._id);
            }}
            onCancel={() => setShowAddSubvenue(false)}
          />
        ) : null}

        {editingSubvenue ? (
          <SubVenueForm
            venueId={venue._id}
            initialData={editingSubvenue}
            onSaved={() => {
              setEditingSubvenue(null);
              fetchSubvenues(venue._id);
            }}
            onCancel={() => setEditingSubvenue(null)}
          />
        ) : null}

        {loadingSubvenues ? (
          <div className="py-6 text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-2" size={24} />
            <p className="text-xs text-muted-foreground">Loading subvenues...</p>
          </div>
        ) : subvenues.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Building size={22} />
            </div>
            <h3 className="text-sm font-bold">No Subvenues Added Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Please click "Add New Subvenue" above to add your courts, pitches, or fields.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {subvenues.map((sv) => {
              const isSelected = sv._id === selectedSubvenueId;
              return (
                <div
                  key={sv._id}
                  onClick={() => setSelectedSubvenueId(sv._id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background/50 hover:bg-muted border-border text-foreground"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-xs font-bold">{sv.name}</p>
                    <p
                      className={`text-[11px] ${
                        isSelected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {sv.sport}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSubvenue(sv);
                        setShowAddSubvenue(false);
                      }}
                      className={`p-1 rounded-full hover:bg-black/10 transition cursor-pointer ${
                        isSelected ? "text-primary-foreground/90" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Edit subvenue details & images"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={deletingSubvenueId === sv._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubvenue(sv._id);
                      }}
                      className={`p-1 rounded-full hover:bg-black/10 transition cursor-pointer ${
                        isSelected ? "text-primary-foreground/90" : "text-muted-foreground hover:text-destructive"
                      }`}
                      title="Delete subvenue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Create Slot Form for Selected Subvenue */}
      {selectedSubvenueId ? (
        <div className="space-y-4">
          <CreateVenueSlotForm
            subvenueId={selectedSubvenueId}
            subvenueName={selectedSubvenue?.name}
            onCreated={() => fetchSlots(selectedSubvenueId, selectedDate)}
          />
        </div>
      ) : null}

      {/* 3. Slot Schedule & Realtime View */}
      {selectedSubvenueId ? (
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight wrap-anywhere">
                Scheduled Slots - {selectedSubvenue?.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
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
                Loading slots for {selectedDate}...
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Calendar size={22} />
              </div>
              <h3 className="text-sm font-bold">No Slots on {selectedDate}</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No slots are scheduled for {selectedSubvenue?.name} on this date.
                Create one above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {slots.map((slot) => (
                <VenueSlotCard
                  key={slot._id}
                  slot={slot}
                  isVenueView={true}
                  isActionLoading={cancellingSlotId === slot._id}
                  onCancelSlot={handleCancelSlot}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}