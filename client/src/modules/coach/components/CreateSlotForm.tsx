import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { coachApi, type CreateCoachSlotInput } from "../api/coach.api";
import { formatTimeInput } from "../../../utils/formatTime";

interface CreateSlotFormProps {
  onCreated?: () => void;
}

export default function CreateSlotForm({ onCreated }: CreateSlotFormProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [newSlotDate, setNewSlotDate] = useState(todayStr);
  const [startTimeStr, setStartTimeStr] = useState(formatTimeInput(Date.now()));
  const [endTimeStr, setEndTimeStr] = useState(
    formatTimeInput(Date.now() + 60 * 60 * 1000),
  );
  const [creatingSlot, setCreatingSlot] = useState(false);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSlotDate || !startTimeStr || !endTimeStr) {
      toast.error("Please fill in slot date and times");
      return;
    }

    const startEpoch = new Date(`${newSlotDate}T${startTimeStr}:00`).getTime();
    const endEpoch = new Date(`${newSlotDate}T${endTimeStr}:00`).getTime();

    if (startEpoch <= Date.now()) {
      toast.error("Start time must be in the future");
      return;
    }

    if (endEpoch <= startEpoch) {
      toast.error("End time must be after start time");
      return;
    }

    const durationMs = endEpoch - startEpoch;

    if (durationMs < 30 * 60 * 1000) {
      toast.error("A slot must be at least 30 minutes long");
      return;
    }

    setCreatingSlot(true);

    try {
      const slotInput: CreateCoachSlotInput = {
        date: newSlotDate,
        startEpoch,
        endEpoch,
      };

      const res = await coachApi.createSlot(slotInput);

      if (res.success) {
        toast.success("Slot added successfully!");
        if (onCreated) {
          onCreated();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create slot");
    } finally {
      setCreatingSlot(false);
    }
  };

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold tracking-tight">
          Create Available Slot
        </h2>
        <p className="text-xs text-muted-foreground">
          Schedule time when players can book training sessions with you
        </p>
      </div>

      <form onSubmit={handleCreateSlot} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={newSlotDate}
              min={todayStr}
              onChange={(e) => setNewSlotDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs font-medium transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Start Time
            </label>
            <input
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs font-medium transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              End Time
            </label>
            <input
              type="time"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs font-medium transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={creatingSlot}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {creatingSlot ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add Slot
          </button>
        </div>
      </form>
    </div>
  );
}
