import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  IndianRupee,
  Users,
} from "lucide-react";
import type { VenueSlotData } from "../api/venueOwner.api";
import { formatTimeEpoch } from "../../../utils/formatTime";

interface VenueSlotCardProps {
  slot: VenueSlotData;
  isVenueView?: boolean;
  isActionLoading?: boolean;
  onRequestBooking?: (slotId: string) => void;
  onCreateGame?: (slot: VenueSlotData) => void;
  onCancelSlot?: (slotId: string) => void;
}

export default function VenueSlotCard({
  slot,
  isVenueView = false,
  isActionLoading = false,
  onRequestBooking,
  onCreateGame,
  onCancelSlot,
}: VenueSlotCardProps) {
  const startTime = formatTimeEpoch(slot.startEpoch);
  const endTime = formatTimeEpoch(slot.endEpoch);

  const getStatusBadge = () => {
    if (slot.status === "available") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
          Available
        </span>
      );
    }

    if (slot.status === "booked") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
          Booked
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted/60 text-muted-foreground border border-border line-through">
        Cancelled
      </span>
    );
  };

  return (
    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0 overflow-hidden">
      {/* Time, Date, and Price info */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Clock size={16} className="text-foreground/70 shrink-0" />

          <span className="text-sm font-bold text-foreground tracking-tight break-all">
            {startTime} - {endTime}
          </span>

          {getStatusBadge()}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <p>
            Date:{" "}
            <span className="font-mono text-foreground/80 break-all">
              {slot.date}
            </span>
          </p>

          <span className="text-border">•</span>

          <p className="flex items-center gap-0.5 font-semibold text-foreground/90">
            <IndianRupee size={13} className="text-primary -mr-0.5" />
            {slot.price}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Player View: Create Game Button */}
        {!isVenueView && slot.status === "available" && onCreateGame ? (
          <button
            type="button"
            onClick={() => onCreateGame(slot)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Users size={13} />
            Create Game
          </button>
        ) : null}

        {/* Player View: Request Booking Button */}
        {!isVenueView && slot.status === "available" && onRequestBooking ? (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onRequestBooking(slot._id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isActionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={13} />
            )}
            Book Directly
          </button>
        ) : null}

        {/* Venue Owner View: Cancel Slot Button */}
        {isVenueView && slot.status === "available" && onCancelSlot ? (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onCancelSlot(slot._id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-50 cursor-pointer"
          >
            {isActionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <XCircle size={13} />
            )}
            Cancel Slot
          </button>
        ) : null}
      </div>
    </div>
  );
}