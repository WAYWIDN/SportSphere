import { useState } from "react";
import {
  X,
  Users,
  Trophy,
  Calendar,
  Clock,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { gameApi } from "../api/game.api";
import { formatTimeEpoch } from "../../../utils/formatTime";
import type { VenueSlotData } from "../../venue-owner/api/venueOwner.api";

interface CreateGameModalProps {
  subvenueId: string;
  subvenueName?: string;
  sportName?: string;
  slot: VenueSlotData;
  isOpen: boolean;
  onClose: () => void;
  onGameCreated?: (gameId: string) => void;
}

export default function CreateGameModal({
  subvenueId,
  subvenueName,
  sportName,
  slot,
  isOpen,
  onClose,
  onGameCreated,
}: CreateGameModalProps) {
  const navigate = useNavigate();
  const [minPlayers, setMinPlayers] = useState<number>(2);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const startTime = formatTimeEpoch(slot.startEpoch);
  const endTime = formatTimeEpoch(slot.endEpoch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (minPlayers < 1) {
      toast.error("Minimum players must be at least 1");
      return;
    }

    if (maxPlayers < minPlayers) {
      toast.error("Maximum players cannot be less than minimum players");
      return;
    }

    setCreating(true);

    try {
      const res = await gameApi.createGame({
        subvenueId,
        slotId: slot._id,
        minimumPlayers: Number(minPlayers),
        maximumPlayers: Number(maxPlayers),
      });

      if (res.success && res.data) {
        toast.success(
          "Game created! Other players can now find and request to join your game."
        );
        onClose();
        if (onGameCreated) {
          onGameCreated(res.data._id);
        } else {
          navigate(`/games/${res.data._id}`);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create game");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-lg rounded-[2.5rem] border border-border p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-primary/10 text-primary">
                <Users size={18} />
              </span>
              <h2 className="text-xl font-bold tracking-tight">Create a Game</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Host a match on this slot and invite other players to join
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slot Overview Summary */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-foreground">{subvenueName ?? "Court"}</span>
            {sportName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border text-[11px]">
                <Trophy size={11} /> {sportName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-foreground" />
              <span>{slot.date}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock size={13} className="text-foreground" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>

            <div className="flex items-center gap-0.5 text-foreground font-semibold ml-auto">
              <IndianRupee size={12} className="text-primary -mr-0.5" />
              <span>{slot.price}</span>
            </div>
          </div>
        </div>

        {/* Form for Min and Max Players */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Min Players Required
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={minPlayers}
                onChange={(e) => setMinPlayers(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
              />
              <p className="text-[11px] text-muted-foreground">
                Minimum players needed before booking
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Max Player Capacity
              </label>
              <input
                type="number"
                min={minPlayers}
                max={100}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
              />
              <p className="text-[11px] text-muted-foreground">
                Total max players allowed in match
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {creating && <Loader2 size={14} className="animate-spin" />}
              {creating ? "Creating Game..." : (
                <>
                  <Users size={14} />
                  Create Game
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
