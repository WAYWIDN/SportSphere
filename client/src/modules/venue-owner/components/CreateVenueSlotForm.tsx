import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type CreateVenueSlotInput,
} from "../api/venueOwner.api";
import { formatTimeInput } from "../../../utils/formatTime";

interface CreateVenueSlotFormProps {
  subvenueId: string;
  subvenueName?: string;
  onCreated?: () => void;
}

export default function CreateVenueSlotForm({
  subvenueId,
  subvenueName,
  onCreated,
}: CreateVenueSlotFormProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [slotDate, setSlotDate] = useState(todayStr);
  const [startTimeStr, setStartTimeStr] = useState(formatTimeInput(Date.now()));
  const [endTimeStr, setEndTimeStr] = useState(formatTimeInput(Date.now() + 60 * 60 * 1000));
  const [price, setPrice] = useState("30");
  const [creatingSlot, setCreatingSlot] = useState(false);

  const inputClasses =
    "w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs font-medium transition";

  const labelClasses =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slotDate || !startTimeStr || !endTimeStr || !price) {
      toast.error("Please fill in date, times, and price");
      return;
    }

    const startEpoch = new Date(`${slotDate}T${startTimeStr}:00`).getTime();

    const endEpoch = new Date(`${slotDate}T${endTimeStr}:00`).getTime();

    if (Number.isNaN(startEpoch) || Number.isNaN(endEpoch)) {
      toast.error("Please enter a valid date and time");
      return;
    }

    if(startEpoch <= Date.now()) {
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

    const priceNum = Number(price);

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setCreatingSlot(true);

    try {
      const slotInput: CreateVenueSlotInput = {
        subvenueId,
        date: slotDate,
        startEpoch,
        endEpoch,
        price: priceNum,
      };

      const res = await venueOwnerApi.createSlot(subvenueId, slotInput);

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
          Create Available Slot {subvenueName ? `for ${subvenueName}` : ""}
        </h2>

        <p className="text-xs text-muted-foreground wrap-anywhere">
          Schedule time slots for players to book this subvenue
        </p>
      </div>

      <form onSubmit={handleCreateSlot} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className={labelClasses}>Date</label>

            <input
              type="date"
              value={slotDate}
              min={todayStr}
              onChange={(e) => setSlotDate(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>Start Time</label>

            <input
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>End Time</label>

            <input
              type="time"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>Price (₹)</label>

            <input
              type="number"
              value={price}
              min={0}
              step={0.01}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 40"
              required
              className={inputClasses}
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
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={14} />
                Add Slot
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
