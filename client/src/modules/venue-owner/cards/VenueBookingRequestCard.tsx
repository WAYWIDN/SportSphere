import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  IndianRupee,
} from "lucide-react";
import type { BookingRequestItem } from "../api/venueOwner.api";
import { formatTimeEpoch } from "./VenueSlotCard";

interface VenueBookingRequestCardProps {
  request: BookingRequestItem;
  isVenueView?: boolean;
  isProcessing?: boolean;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

export default function VenueBookingRequestCard({
  request,
  isVenueView = false,
  isProcessing = false,
  onApprove,
  onReject,
}: VenueBookingRequestCardProps) {
  const slot =
    typeof request.slotId === "object" && request.slotId !== null
      ? (request.slotId as any)
      : null;

  const subvenue =
    typeof request.subvenueId === "object" && request.subvenueId !== null
      ? (request.subvenueId as any)
      : null;

  const userEmail =
    typeof request.userId === "object" && request.userId !== null
      ? (request.userId as { email: string }).email
      : "Player";

  const getStatusBadge = () => {
    if (request.status === "approved") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
          Accepted / Booked
        </span>
      );
    }

    if (request.status === "rejected") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          Rejected
        </span>
      );
    }

    if (request.status === "cancelled") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          Cancelled
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
      {/* Booking Details */}
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground min-w-0">
            <User
              size={14}
              className="text-muted-foreground shrink-0"
            />

            <span className="break-all">
              {isVenueView ? `Applicant: ${userEmail}` : userEmail}
            </span>
          </div>

          {getStatusBadge()}
        </div>

        {subvenue ? (
          <div className="text-xs text-muted-foreground break-all">
            <span className="font-medium text-foreground/80">
              Court:
            </span>{" "}
            {subvenue.name}
            {subvenue.sport ? ` (${subvenue.sport})` : ""}
          </div>
        ) : null}

        {slot ? (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <Calendar size={13} />
              {slot.date}
            </span>

            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <Clock size={13} />
              {formatTimeEpoch(slot.startEpoch)} –{" "}
              {formatTimeEpoch(slot.endEpoch)}
            </span>

            {slot.price !== undefined ? (
              <span className="flex items-center gap-0.5 font-medium text-foreground/80">
                <IndianRupee size={13} />
                {slot.price}
              </span>
            ) : null}
          </div>
        ) : null}

        <p className="text-[11px] text-muted-foreground">
          Requested:{" "}
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Action Buttons */}
      {isVenueView &&
      request.status === "pending" &&
      onApprove &&
      onReject ? (
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onReject(request._id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <XCircle size={12} />
            )}
            Reject
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onApprove(request._id)}
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isProcessing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCircle2 size={12} />
            )}
            Accept
          </button>
        </div>
      ) : null}
    </div>
  );
}