import { Check, X, User as UserIcon, Loader2, Clock } from "lucide-react";
import type { GameJoinRequestData } from "../api/game.api";
import { formatUserName } from "../../../utils/formatUserName";

const RESOLVED_STATUS_STYLE: Record<string, string> = {
  accepted:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  rejected: "bg-muted text-muted-foreground border border-border",
};

interface GameJoinRequestCardProps {
  request: GameJoinRequestData;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isActionLoading?: boolean;
}

export default function GameJoinRequestCard({
  request,
  onAccept,
  onReject,
  isActionLoading = false,
}: GameJoinRequestCardProps) {
  const playerName = formatUserName(request.userId, "Player");

  const requestedAt = new Date(request.createdAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-background/60 rounded-2xl p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <UserIcon size={18} />
        </div>

        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{playerName}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock size={11} /> Requested {requestedAt}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {request.status === "pending" && (
          <>
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onReject(request._id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-50 cursor-pointer"
            >
              <X size={13} /> Reject
            </button>

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onAccept(request._id)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isActionLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              Accept
            </button>
          </>
        )}

        {request.status !== "pending" && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${RESOLVED_STATUS_STYLE[request.status] ?? "bg-muted text-muted-foreground border border-border"}`}
          >
            {request.status}
          </span>
        )}
      </div>
    </div>
  );
}
