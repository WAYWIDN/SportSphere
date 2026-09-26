import { Plus, Loader2 } from "lucide-react";

interface CreateSlotFormProps {
  todayStr: string;
  newSlotDate: string;
  startTimeStr: string;
  endTimeStr: string;
  creatingSlot: boolean;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateSlotForm({
  todayStr,
  newSlotDate,
  startTimeStr,
  endTimeStr,
  creatingSlot,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onSubmit,
}: CreateSlotFormProps) {
  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold tracking-tight">Create Available Slot</h2>
        <p className="text-xs text-muted-foreground">
          Schedule time when players can book training sessions with you
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={newSlotDate}
              min={todayStr}
              onChange={(e) => onDateChange(e.target.value)}
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
              onChange={(e) => onStartTimeChange(e.target.value)}
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
              onChange={(e) => onEndTimeChange(e.target.value)}
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
            {creatingSlot ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Slot
          </button>
        </div>
      </form>
    </div>
  );
}
