import { useEffect, useState } from "react";
import {
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";
import PageButtons from "../../../components/ui/PageButtons";
import { toast } from "react-toastify";
import { venueOwnerApi, type BookingRequestItem } from "../api/venueOwner.api";
import VenueBookingRequestCard from "../cards/VenueBookingRequestCard";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function VenueBookingRequestsSection() {
  const [requests, setRequests] = useState<BookingRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );
  // Status Filter
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  const fetchRequests = async (status: StatusFilter, cursor?: string) => {
    setLoadingRequests(true);

    if (cursor === undefined) {
      setCurrentPage(1);
      setCursorHistory([undefined]);
    }

    setNextCursor(null);
    setHasNext(false);

    try {
      const res = await venueOwnerApi.getMyBookingRequests(status, cursor);

      if (res.success) {
        setRequests(res.data || []);
        setNextCursor(res.pagination?.lastRequestId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load booking requests",
      );

      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter);
  }, [statusFilter]);

  const handleNextPage = async () => {
    if (!hasNext || !nextCursor || loadingPage) return;

    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;
    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    setLoadingPage(true);

    try {
      const res = await venueOwnerApi.getMyBookingRequests(
        statusFilter,
        nextCursor,
      );

      if (res.success) {
        setRequests(res.data || []);
        setNextCursor(res.pagination?.lastRequestId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load next page");
    } finally {
      setLoadingPage(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || loadingPage) return;

    const prevPage = currentPage - 1;
    const prevCursor = cursorHistory[prevPage - 1];
    setCurrentPage(prevPage);
    setLoadingPage(true);

    try {
      const res = await venueOwnerApi.getMyBookingRequests(
        statusFilter,
        prevCursor,
      );

      if (res.success) {
        setRequests(res.data || []);
        setNextCursor(res.pagination?.lastRequestId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load previous page",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    setProcessingRequestId(requestId);

    try {
      const res = await venueOwnerApi.updateBookingRequestStatus(
        requestId,
        status,
      );

      if (res.success) {
        if (status === "approved") {
          toast.success("Booking request approved!");
        } else {
          toast.info("Booking request rejected.");
        }

        // Refetch current page without resetting pagination
        const currentCursor = cursorHistory[currentPage - 1];

        const updated = await venueOwnerApi.getMyBookingRequests(
          statusFilter,
          currentCursor,
        );

        if (updated.success) {
          setRequests(updated.data || []);
          setNextCursor(updated.pagination?.lastRequestId || null);
          setHasNext(updated.pagination?.hasNext || false);
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update booking request",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const filterTabs: {
    key: StatusFilter;
    label: string;
  }[] = [
    {
      key: "all",
      label: "All Requests",
    },
    {
      key: "pending",
      label: "Pending",
    },
    {
      key: "approved",
      label: "Accepted / Booked",
    },
    {
      key: "rejected",
      label: "Rejected",
    },
  ];

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Booking Requests</h2>

          <p className="text-xs text-muted-foreground">
            Review and respond to player court booking requests
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchRequests(statusFilter, cursorHistory[currentPage - 1])
          }
          disabled={loadingRequests}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw
            size={12}
            className={loadingRequests ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Requests */}
      {loadingRequests ? (
        <div className="py-12 text-center">
          <Loader2
            className="animate-spin text-primary mx-auto mb-2"
            size={28}
          />

          <p className="text-xs text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Inbox size={22} />
          </div>

          <h3 className="text-sm font-bold">
            No {statusFilter !== "all" ? statusFilter : ""} Requests Found
          </h3>

          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {statusFilter === "all"
              ? "When players request slots at your venue, they will appear here."
              : `There are currently no ${statusFilter} booking requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 gap-3 min-w-0">
            {requests.map((request) => (
              <VenueBookingRequestCard
                key={request._id}
                request={request}
                isVenueView={true}
                isProcessing={processingRequestId === request._id}
                onApprove={(requestId) =>
                  handleUpdateRequestStatus(requestId, "approved")
                }
                onReject={(requestId) =>
                  handleUpdateRequestStatus(requestId, "rejected")
                }
              />
            ))}
          </div>

          <PageButtons
            currentPage={currentPage}
            hasNext={hasNext}
            loading={loadingPage}
            onPrevious={handlePrevPage}
            onNext={handleNextPage}
          />
        </div>
      )}
    </div>
  );
}
