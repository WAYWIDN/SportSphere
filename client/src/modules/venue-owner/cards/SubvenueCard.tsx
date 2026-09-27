import { Building, Trophy, Trash2 } from "lucide-react";
import type { SubvenueData } from "../api/venueOwner.api";

interface SubvenueCardProps {
  subvenue: SubvenueData;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export default function SubvenueCard({
  subvenue,
  isSelected = false,
  onSelect,
  onDelete,
  isDeleting = false,
}: SubvenueCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`bg-card rounded-3xl p-5 border transition cursor-pointer space-y-3 min-w-0 overflow-hidden ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-foreground/20 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground/50 shrink-0 overflow-hidden">
            {subvenue.images && subvenue.images.length > 0 ? (
              <img
                src={subvenue.images[0]}
                alt={subvenue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building size={22} />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground tracking-tight truncate">
              {subvenue.name}
            </h3>

            {subvenue.sport ? (
              <span className="inline-flex items-center gap-1 max-w-full px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
                <Trophy size={11} className="shrink-0" />
                <span className="truncate">{subvenue.sport}</span>
              </span>
            ) : null}
          </div>
        </div>

        {onDelete ? (
          <button
            type="button"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
            title="Delete Subvenue"
          >
            <Trash2 size={15} />
          </button>
        ) : null}
      </div>

      {subvenue.description ? (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed wrap-break-words">
          {subvenue.description}
        </p>
      ) : null}
    </div>
  );
}