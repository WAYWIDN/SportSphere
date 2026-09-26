import { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  Loader2,
  RefreshCw,
  Inbox,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminApi, type PendingApplicationItem } from "../api/admin.api";
import { useAuth } from "../../../context/AuthContext";
import ApplicationCard from "../cards/ApplicationCard";

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<PendingApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Pagination state: tracks page number and cursor history for backward/forward navigation
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // Modal for previewing document
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  useEffect(() => {
    loadPage(undefined);
  }, []);

  const loadPage = async (cursor?: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingApplications(cursor);
      if (res.success) {
        setApplications(res.data);
        setNextCursor(res.pagination.lastApplicationId);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch pending applications");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setCursorHistory([undefined]);
    loadPage(undefined);
  };

  const handleNextPage = () => {
    if (!hasNext || !nextCursor) {
      return;
    }

    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;

    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    loadPage(nextCursor);
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) {
      return;
    }

    const prevPage = currentPage - 1;
    const prevCursor = cursorHistory[prevPage - 1];

    setCurrentPage(prevPage);
    loadPage(prevCursor);
  };

  const handleUpdateStatus = async (
    applicationId: string,
    status: "approved" | "rejected"
  ) => {
    setProcessingId(applicationId);
    try {
      const res = await adminApi.updateApplicationStatus(applicationId, status);
      if (res.success) {
        if (status === "approved") {
          toast.success("Application approved successfully!");
        } else {
          toast.info("Application rejected.");
        }

        // Remove the processed application from list
        setApplications((prev) =>
          prev.filter((item) => item.applicationId !== applicationId)
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update application status");
    } finally {
      setProcessingId(null);
    }
  };

  // Non-admin warning guard
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You do not have administrator permissions to view this portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-black-500/10 text-white-700">
                  <ShieldCheck size={22} />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Admin Portal
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Review and process role upgrade requests for Coaches and Venue Owners.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-semibold bg-background hover:bg-muted transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Applications List Section */}
        {loading ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
            <Loader2 className="animate-spin text-primary mx-auto mb-3" size={32} />
            <p className="text-sm text-muted-foreground">Loading pending applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox size={26} />
            </div>
            <h3 className="text-lg font-bold">No Pending Requests</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              All coach and venue owner applications have been reviewed. New requests will show up here automatically.
            </p>
            {currentPage > 1 ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold bg-background hover:bg-muted cursor-pointer"
                >
                  <ChevronLeft size={14} /> Go Back to Previous Page
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Pending Requests (Page {currentPage})
              </h2>

              <span className="text-xs text-muted-foreground">
                Showing {applications.length} on this page
              </span>
            </div>

            {/* Application Cards List */}
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.applicationId}
                  application={app}
                  isProcessing={processingId === app.applicationId}
                  onApprove={(id) => handleUpdateStatus(id, "approved")}
                  onReject={(id) => handleUpdateStatus(id, "rejected")}
                  onPreviewDoc={(url) => setPreviewDocUrl(url)}
                />
              ))}
            </div>

            {/* Pagination Controls with Previous and Next Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border px-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={handlePrevPage}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-xs font-semibold bg-card hover:bg-muted transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Previous Page
              </button>

              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                Page {currentPage}
              </span>

              <button
                type="button"
                disabled={!hasNext || loading}
                onClick={handleNextPage}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-xs font-semibold bg-card hover:bg-muted transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Page
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDocUrl ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card rounded-[2rem] max-w-2xl w-full max-h-[85vh] overflow-hidden border border-border shadow-2xl flex flex-col">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <FileText size={18} className="text-primary" />
                  Verification Document Preview
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocUrl(null)}
                  className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-muted/20">
                {previewDocUrl.endsWith(".pdf") ? (
                  <div className="text-center space-y-4 py-8">
                    <FileText size={48} className="mx-auto text-primary" />
                    <p className="text-sm font-medium">PDF Document Ready</p>
                    <a
                      href={previewDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
                    >
                      Open in New Tab <ExternalLink size={14} />
                    </a>
                  </div>
                ) : (
                  <img
                    src={previewDocUrl}
                    alt="Verification Document"
                    className="max-h-[60vh] max-w-full object-contain rounded-xl border border-border"
                  />
                )}
              </div>

              <div className="p-4 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewDocUrl(null)}
                  className="px-5 py-2 rounded-full border border-border text-xs font-medium hover:bg-muted transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
