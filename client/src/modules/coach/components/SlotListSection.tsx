import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { CoachSlotData } from "../api/coach.api";
import CoachSlotCard from "../cards/CoachSlotCard";

interface SlotListSectionProps {
  slots: CoachSlotData[];
  loadingSlots: boolean;
  loadingPage: boolean;
  currentPage: number;
  hasNextSlots: boolean;
  filterDate: string;
  cancellingSlotId: string | null;
  onFilterDateChange: (date: string) => void;
  onClearFilter: () => void;
  onCancelSlot: (slotId: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function SlotListSection({
  slots,
  loadingSlots,
  loadingPage,
  currentPage,
  hasNextSlots,
  filterDate,
  cancellingSlotId,
  onFilterDateChange,
  onClearFilter,
  onCancelSlot,
  onPreviousPage,
  onNextPage,
}: SlotListSectionProps) {
  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Scheduled Slots</h2>

          <p className="text-xs text-muted-foreground">
            View and manage your open and booked slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter date:</span>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => onFilterDateChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs"
          />

          {filterDate ? (
            <button
              type="button"
              onClick={onClearFilter}
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {loadingSlots ? (
        <div className="py-12 text-center">
          <Loader2
            className="animate-spin text-primary mx-auto mb-2"
            size={28}
          />

          <p className="text-xs text-muted-foreground">Loading your slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Calendar size={22} />
          </div>

          <h3 className="text-sm font-bold">No Slots Found</h3>

          <p className="text-xs text-muted-foreground">
            You haven't scheduled any slots for this date yet. Create one above!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {slots.map((slot) => (
              <CoachSlotCard
                key={slot._id}
                slot={slot}
                isCoachView={true}
                isActionLoading={cancellingSlotId === slot._id}
                onCancelSlot={onCancelSlot}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={currentPage <= 1 || loadingPage}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="px-4 py-2.5 text-sm font-semibold">
              Page {currentPage}
            </span>

            <button
              type="button"
              onClick={onNextPage}
              disabled={!hasNextSlots || loadingPage}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPage ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
