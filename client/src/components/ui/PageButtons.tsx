import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function PageButtons({
  currentPage,
  hasNext,
  loading,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  hasNext: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (currentPage <= 1 && !hasNext) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage <= 1 || loading}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={14} />
        Previous
      </button>

      <span className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        Page {currentPage}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext || loading}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Next
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  );
}
