import { Link } from "react-router";
import { MapPin, Award, ArrowRight, User } from "lucide-react";
import type { CoachProfileData } from "../api/coach.api";

interface CoachCardProps {
  coach: CoachProfileData;
}

export default function CoachCard({ coach }: CoachCardProps) {
  const centerName = coach.coachingCenter?.name || "Independent Coaching";
  const location = [
    coach.coachingCenter?.city,
    coach.coachingCenter?.state,
    coach.coachingCenter?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Header with Photo/Avatar and Title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground/50 shrink-0 overflow-hidden">
            {coach.profilePictureUrl ? (
              <img
                src={coach.profilePictureUrl}
                alt="Coach"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={26} />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              {centerName}
            </h3>
            {location ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin size={12} />
                {location}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {coach.bio}
        </p>

        {/* Experience & Sports Tags */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Award size={14} className="text-foreground/70" />
            <span>
              {coach.experience} {coach.experience === 1 ? "year" : "years"}{" "}
              experience
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {coach.sports.map((sport) => (
              <span
                key={sport}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Link */}
      <div className="pt-3 border-t border-border">
        <Link
          to={`/coach/${coach.coachId}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-sm"
        >
          View Slots & Book <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
