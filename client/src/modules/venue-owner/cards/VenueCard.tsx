import { Link } from "react-router";
import { MapPin, Building, ArrowRight } from "lucide-react";
import type { VenueProfileData } from "../api/venueOwner.api";

interface VenueCardProps {
  venue: VenueProfileData;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const location = [venue.location?.city, venue.location?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5 min-w-0 overflow-hidden">
      <div className="space-y-4 min-w-0">
        {/* Header with Photo/Avatar and Title */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground/50 shrink-0 overflow-hidden">
            {venue.images && venue.images.length > 0 ? (
              <img
                src={venue.images[0]}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building size={26} />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground tracking-tight line-clamp-1 break-all">
              {venue.name}
            </h3>

            {location ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1 break-all">
                <MapPin size={12} className="shrink-0" />
                {location}
              </p>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-all">
          {venue.description}
        </p>

        {/* Sports Tags */}
        {venue.sports && venue.sports.length > 0 ? (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {venue.sports.map((sport) => (
                <span
                  key={sport}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border break-all"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Link */}
      <div className="pt-3 border-t border-border">
        <Link
          to={`/venues/${venue._id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-sm"
        >
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
