import { useRef } from "react";
import {
  Briefcase,
  Building,
  Upload,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface RoleApplicationCardProps {
  applyRole: "coach" | "venue-owner";
  documentFile: File | null;
  applying: boolean;
  uploadingDoc: boolean;
  onApplyRoleChange: (role: "coach" | "venue-owner") => void;
  onDocumentFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RoleApplicationCard({
  applyRole,
  documentFile,
  applying,
  uploadingDoc,
  onApplyRoleChange,
  onDocumentFileChange,
  onSubmit,
}: RoleApplicationCardProps) {
  const docInputRef = useRef<HTMLInputElement>(null);

  const selectedClasses = "border-primary bg-primary/5 text-primary font-semibold";
  const unselectedClasses =
    "border-input bg-background/50 hover:bg-background text-muted-foreground";

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border relative overflow-hidden">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Become a Partner
      </div>

      <h3 className="text-lg font-bold tracking-tight">Apply for Coach or Venue Owner</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-5 leading-relaxed">
        Expand your opportunities on SportSphere. Provide your verification documents to get reviewed.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2">
            Role to apply for
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onApplyRoleChange("coach")}
              className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition cursor-pointer ${
                applyRole === "coach" ? selectedClasses : unselectedClasses
              }`}
            >
              <Briefcase size={16} />
              Coach
            </button>

            <button
              type="button"
              onClick={() => onApplyRoleChange("venue-owner")}
              className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition cursor-pointer ${
                applyRole === "venue-owner" ? selectedClasses : unselectedClasses
              }`}
            >
              <Building size={16} />
              Venue Owner
            </button>
          </div>
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2">
            Certification / ID Document (PDF or Image)
          </label>

          <input
            type="file"
            ref={docInputRef}
            onChange={(e) => onDocumentFileChange(e.target.files?.[0] || null)}
            accept=".pdf,image/*"
            className="hidden"
          />

          <div
            onClick={() => docInputRef.current?.click()}
            className="border border-dashed border-input rounded-2xl p-4 text-center bg-background/50 hover:bg-background transition cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            {documentFile ? (
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <FileText size={18} className="text-primary" />
                <span className="truncate max-w-[180px]">{documentFile.name}</span>
              </div>
            ) : (
              <>
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload document</span>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={applying || uploadingDoc || !documentFile}
          className="w-full py-3 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          {applying ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {uploadingDoc ? "Uploading Document..." : "Submitting Application..."}
            </>
          ) : (
            <>
              Submit Application <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
