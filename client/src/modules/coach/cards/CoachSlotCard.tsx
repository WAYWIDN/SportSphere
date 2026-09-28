import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { CoachSlotData } from "../api/coach.api";
import { formatTimeEpoch } from "../../../utils/formatTime";

interface CoachSlotCardProps {
  slot: CoachSlotData;
  isCoachView?: boolean;
  isActionLoading?: boolean;
  onRequestSession?: (slotId: string) => void;
  onCancelSlot?: (slotId: string) => void;
}

export default function CoachSlotCard({
  slot,
  isCoachView = false,
  isActionLoading = false,
  onRequestSession,
  onCancelSlot,
}: CoachSlotCardProps) {
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
    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Time and Date info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-foreground/70" />
          <span className="text-sm font-bold text-foreground tracking-tight">
            {startTime} – {endTime}
          </span>
          {getStatusBadge()}
        </div>

        <p className="text-xs text-muted-foreground">
          Date:{" "}
          <span className="font-mono text-foreground/80">{slot.date}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Player View: Request Session Button */}
        {!isCoachView && slot.status === "available" && onRequestSession ? (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onRequestSession(slot._id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isActionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={13} />
            )}
            Book Session
          </button>
        ) : null}

        {/* Coach View: Cancel Slot Button */}
        {isCoachView && slot.status === "available" && onCancelSlot ? (
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
