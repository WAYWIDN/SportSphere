import { Link } from "react-router";
import {
  User,
  FileText,
  ExternalLink,
  Loader2,
  XCircle,
  CheckCircle2,
  Briefcase,
  Building,
  Eye,
} from "lucide-react";
import type { PendingApplicationItem } from "../api/admin.api";

interface ApplicationCardProps {
  application: PendingApplicationItem;
  isProcessing: boolean;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onPreviewDoc: (documentUrl: string) => void;
}

export default function ApplicationCard({
  application,
  isProcessing,
  onApprove,
  onReject,
  onPreviewDoc,
}: ApplicationCardProps) {
  const displayName = application.profileName || "Unnamed Applicant";

  const renderRoleBadge = () => {
    if (application.requestType === "coach") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <Briefcase size={13} />
          Coach Application
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
        <Building size={13} />
        Venue Owner Application
      </span>
    );
  };

  return (
    <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm hover:shadow-md transition space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
      {/* Applicant Information */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground/50 font-bold shrink-0">
          <User size={22} />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-bold text-foreground">{displayName}</h3>
            {renderRoleBadge()}
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            ID: {application.profileId}
          </p>
        </div>
      </div>

      {/* Document Preview, Profile View & Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
        {/* View Applicant Profile Button */}
        <Link
          to={`/profiles/${application.profileId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-input text-xs font-medium bg-background hover:bg-muted transition cursor-pointer"
        >
          <Eye size={14} className="text-primary" />
          View Profile
        </Link>

        {application.documentUrl ? (
          <button
            type="button"
            onClick={() => onPreviewDoc(application.documentUrl)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-input text-xs font-medium bg-background hover:bg-muted transition cursor-pointer"
          >
            <FileText size={14} className="text-primary" />
            View Document
            <ExternalLink size={12} className="text-muted-foreground" />
          </button>
        ) : null}

        {/* Reject Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onReject(application.applicationId)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold hover:bg-destructive/20 transition cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          )}
          Reject
        </button>

        {/* Approve Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onApprove(application.applicationId)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {isProcessing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          Approve
        </button>
      </div>
    </div>
  );
}
