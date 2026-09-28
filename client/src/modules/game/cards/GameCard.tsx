import { Link } from "react-router";
import { Users, Trophy, Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import type { GameData } from "../api/game.api";
import { formatTimeEpoch } from "../../../utils/formatTime";
import { formatUserName } from "../../../utils/formatUserName";

const GAME_STATUS_BADGE: Record<
  string,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  ready: {
    label: "Ready to Book",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    icon: <CheckCircle2 size={12} />,
  },
  booked: {
    label: "Booked",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border border-border line-through",
  },
  forming: {
    label: "Forming",
    className: "bg-primary/10 text-primary border border-primary/20",
  },
};

interface GameCardProps {
  game: GameData;
  currentUserId?: string;
}

export default function GameCard({ game, currentUserId }: GameCardProps) {
  const isHost = game.creatorId._id === currentUserId;

  const isJoined = game.acceptedPlayerIds.some(
    (player) => player._id === currentUserId
  );

  const sport = game.subvenueId.sport || "Sport";
  const subvenueName = game.subvenueId.name || "Court";
  const slot = game.slotId;
  const hostName = formatUserName(game.creatorId, "Player");

  const slotDate = slot?.date ?? "";
  const startTime = slot?.startEpoch ? formatTimeEpoch(slot.startEpoch) : "";
  const endTime = slot?.endEpoch ? formatTimeEpoch(slot.endEpoch) : "";

  const playerCount = game.acceptedPlayerIds.length;
  const { minimumPlayers: minPlayers, maximumPlayers: maxPlayers } = game;
  const progressPercent = Math.min(100, Math.round((playerCount / maxPlayers) * 100));
  const minReached = playerCount >= minPlayers;

  const badge = GAME_STATUS_BADGE[game.status] ?? GAME_STATUS_BADGE.forming;

  return (
    <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5 min-w-0 overflow-hidden group">
      <div className="space-y-4 min-w-0">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            <Trophy size={13} />
            {sport}
          </span>

          <div className="flex items-center gap-1.5">
            {isHost && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground">
                Hosting
              </span>
            )}
            {!isHost && isJoined && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
                Joined
              </span>
            )}

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.className}`}
            >
              {badge.icon}
              {badge.label}
            </span>
          </div>
        </div>

        {/* Court & Venue Info */}
        <div className="space-y-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground tracking-tight line-clamp-1">
            {subvenueName}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            Hosted by <span className="text-foreground font-medium">{hostName}</span>
          </p>
        </div>

        {/* Date & Time */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/60">
          {slotDate && (
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-foreground" />
              <span>{slotDate}</span>
            </div>
          )}
          {startTime && endTime && (
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-foreground" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          )}
        </div>

        {/* Player Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users size={13} />
              Players
            </span>
            <span className="font-semibold text-foreground">
              {playerCount} / {maxPlayers}{" "}
              <span className="text-muted-foreground text-[11px] font-normal">
                (min {minPlayers})
              </span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${minReached ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {minReached && game.status === "ready" ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Min requirement reached! Ready to book.
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Need {Math.max(0, minPlayers - playerCount)} more players to reach minimum
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-border">
        <Link
          to={`/games/${game._id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-sm group-hover:gap-2.5"
        >
          {isHost ? "Manage Game" : "View Game & Join"}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
