import { useEffect, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import PageButtons from "../../../components/ui/PageButtons";
import { toast } from "react-toastify";
import { coachApi, type CoachSlotData } from "../api/coach.api";
import CoachSlotCard from "../cards/CoachSlotCard";
import CreateSlotForm from "./CreateSlotForm";

export default function SlotListSection() {
  const [filterDate, setFilterDate] = useState("");
  const [slots, setSlots] = useState<CoachSlotData[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(number | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNextSlots, setHasNextSlots] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  const fetchMySlots = async (dateParam?: string, cursor?: number) => {
    setLoadingSlots(true);

    if (cursor === undefined) {
      setCurrentPage(1);
      setCursorHistory([undefined]);
    }

    setNextCursor(null);
    setHasNextSlots(false);

    try {
      const res = await coachApi.getMySlots(dateParam, cursor);

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load slots");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchMySlots();
  }, []);

  const handleNextPage = async () => {
    if (!hasNextSlots || nextCursor === null || loadingPage) {
      return;
    }

    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;

    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    setLoadingPage(true);

    try {
      const res = await coachApi.getMySlots(filterDate, nextCursor);

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load next page");
    } finally {
      setLoadingPage(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || loadingPage) {
      return;
    }

    const prevPage = currentPage - 1;
    const prevCursor = cursorHistory[prevPage - 1];
    setCurrentPage(prevPage);
    setLoadingPage(true);

    try {
      const res = await coachApi.getMySlots(filterDate, prevCursor);

      if (res.success) {
        setSlots(res.data || []);
        setNextCursor(res.pagination.lastStartEpoch);
        setHasNextSlots(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load previous page",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const handleCancelSlot = async (slotId: string) => {
    setCancellingSlotId(slotId);

    try {
      const res = await coachApi.cancelSlot(slotId);

      if (res.success) {
        toast.info("Slot cancelled");
        fetchMySlots(filterDate, cursorHistory[currentPage - 1]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel slot");
    } finally {
      setCancellingSlotId(null);
    }
  };

  const handleFilterDateChange = (date: string) => {
    setFilterDate(date);
    setCurrentPage(1);
    setCursorHistory([undefined]);
    fetchMySlots(date);
  };

  const handleClearFilter = () => {
    setFilterDate("");
    setCurrentPage(1);
    setCursorHistory([undefined]);
    fetchMySlots("");
  };

  const handleSlotCreated = () => {
    fetchMySlots(filterDate);
  };

  return (
    <div className="space-y-8">
      <CreateSlotForm onCreated={handleSlotCreated} />

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
              onChange={(e) => handleFilterDateChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs"
            />

            {filterDate ? (
              <button
                type="button"
                onClick={handleClearFilter}
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
                  onCancelSlot={handleCancelSlot}
                />
              ))}
            </div>

            <PageButtons
              currentPage={currentPage}
              hasNext={hasNextSlots}
              loading={loadingPage}
              onPrevious={handlePrevPage}
              onNext={handleNextPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
