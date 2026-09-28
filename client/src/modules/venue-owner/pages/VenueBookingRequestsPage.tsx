import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Inbox,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "react-toastify";
import PageButtons from "../../../components/ui/PageButtons";
import {
  venueOwnerApi,
  type BookingRequestItem,
} from "../api/venueOwner.api";
import { formatTimeEpoch } from "../../../utils/formatTime";
import { formatUserName } from "../../../utils/formatUserName";

export default function VenueBookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (cursor?: string) => {
    setLoading(true);
    if (cursor === undefined) {
      setCurrentPage(1);
      setCursorHistory([undefined]);
    }
    try {
      const res = await venueOwnerApi.getMyBookingRequests(undefined, cursor);
      if (res.success) {
        setRequests(res.data || []);
        setNextCursor(res.pagination?.lastRequestId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load booking requests",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasNext || !nextCursor || loadingPage) return;
    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;
    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    setLoadingPage(true);
    try {
      const res = await venueOwnerApi.getMyBookingRequests(undefined, nextCursor);
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
      const res = await venueOwnerApi.getMyBookingRequests(undefined, prevCursor);
      if (res.success) {
        setRequests(res.data || []);
        setNextCursor(res.pagination?.lastRequestId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load previous page");
    } finally {
      setLoadingPage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          Rejected
        </span>
      );
    }

    if (status === "cancelled") {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground font-medium">
            Loading booking requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back and Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/venue-owner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer bg-card shadow-sm w-fit"
          >
            <ArrowLeft size={14} /> Back to Venue Dashboard
          </Link>

          <button
            type="button"
            onClick={() => fetchRequests()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer w-fit"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>

        {/* Sessions Card Container */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold tracking-tight">
              Venue Booking Requests
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and manage incoming bookings for your courts
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox size={22} />
              </div>
              <h3 className="text-sm font-bold">No Booking Requests</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No player booking requests received yet.
              </p>
              <Link
                to="/venues"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm mt-2"
              >
                Browse Venues <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {requests.map((request) => {
                  const slot = request.slotId;
                  const subvenue = request.subvenueId;
                  const applicantName = formatUserName(request.userId, "Player");

                  return (
                    <div
                      key={request._id}
                      className="bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {applicantName}
                          </span>
                          {subvenue ? (
                            <span className="text-xs text-muted-foreground">
                              • {subvenue.name}
                            </span>
                          ) : null}
                          {getStatusBadge(request.status)}
                        </div>

                        {slot ? (
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono text-foreground/80">
                              <Calendar size={13} />
                              {slot.date}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-foreground/80">
                              <Clock size={13} />
                              {formatTimeEpoch(slot.startEpoch)} –{" "}
                              {formatTimeEpoch(slot.endEpoch)}
                            </span>
                            {slot.price ? (
                              <span className="flex items-center font-medium text-foreground/80">
                                <DollarSign
                                  size={13}
                                  className="text-primary -mr-0.5"
                                />
                                {slot.price}
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <p className="text-[11px] text-muted-foreground">
                          Requested on:{" "}
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
      </div>
    </div>
  );
}