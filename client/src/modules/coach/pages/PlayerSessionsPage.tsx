import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Loader2, ArrowLeft, RefreshCw, Inbox, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { coachApi, type SessionRequestItem } from "../api/coach.api";
import SessionRequestCard from "../cards/SessionRequestCard";
import { useAuth } from "../../../context/AuthContext";

export default function PlayerSessionsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SessionRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await coachApi.getUserSessionRequests();
      if (res.success) {
        setRequests(res.data);
        setLastRequestId(res.pagination.lastRequestId);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load coaching sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!lastRequestId || loadingMore) return;

    setLoadingMore(true);
    try {
      const res = await coachApi.getUserSessionRequests(lastRequestId);
      if (res.success) {
        setRequests((prev) => [...prev, ...res.data]);
        setLastRequestId(res.pagination.lastRequestId);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load more sessions");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <h2 className="text-xl font-bold">Please Log In</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to your player account to track your coaching sessions and bookings.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            Sign In
          </Link>
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
            to="/coach"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer bg-card shadow-sm w-fit"
          >
            <ArrowLeft size={14} /> Back to Coaches
          </Link>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer w-fit"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Sessions Card Container */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold tracking-tight">My Coaching Sessions</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your requested and confirmed training sessions with sports coaches
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
              <p className="text-xs text-muted-foreground">Loading your sessions...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox size={22} />
              </div>
              <h3 className="text-sm font-bold">No Requested Sessions Yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                You haven't requested any coaching sessions. Discover coaches and find the right time slot for you!
              </p>
              <Link
                to="/coach"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm mt-2"
              >
                Browse Coaches <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {requests.map((request) => (
                  <SessionRequestCard
                    key={request._id}
                    request={request}
                    isCoachView={false}
                  />
                ))}
              </div>

              {hasNext ? (
                <div className="text-center pt-3">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={handleLoadMore}
                    className="px-5 py-2 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
                  >
                    {loadingMore ? "Loading..." : "Load More Sessions"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
