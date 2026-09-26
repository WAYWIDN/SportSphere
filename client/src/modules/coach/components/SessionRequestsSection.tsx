import { Inbox, Loader2 } from "lucide-react";
import type { SessionRequestItem } from "../api/coach.api";
import SessionRequestCard from "../cards/SessionRequestCard";

interface SessionRequestsSectionProps {
  requests: SessionRequestItem[];
  loadingRequests: boolean;
  processingRequestId: string | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export default function SessionRequestsSection({
  requests,
  loadingRequests,
  processingRequestId,
  onApprove,
  onReject,
}: SessionRequestsSectionProps) {
  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold tracking-tight">Player Session Requests</h2>
        <p className="text-xs text-muted-foreground">
          Approve or reject booking requests from players
        </p>
      </div>

      {loadingRequests ? (
        <div className="py-12 text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
          <p className="text-xs text-muted-foreground">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Inbox size={22} />
          </div>
          <h3 className="text-sm font-bold">No Session Requests</h3>
          <p className="text-xs text-muted-foreground">
            When players request to book a training slot with you, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {requests.map((request) => (
            <SessionRequestCard
              key={request._id}
              request={request}
              isCoachView={true}
              isProcessing={processingRequestId === request._id}
              onApprove={(id) => onApprove(id)}
              onReject={(id) => onReject(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
