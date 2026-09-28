import { useEffect, useState } from "react";
import { Building, Plus, Loader2, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type VenueProfileData,
  type SubvenueData,
} from "../api/venueOwner.api";
import { useAuth } from "../../../context/AuthContext";
import SubvenueCard from "../cards/SubvenueCard";
import type { TabKey } from "./DashboardTabs";

interface VenueOverviewSectionProps {
  onSwitchTab?: (tab: TabKey) => void;
}

export default function VenueOverviewSection({
  onSwitchTab,
}: VenueOverviewSectionProps) {
  const { user } = useAuth();
  const [venue, setVenue] = useState<VenueProfileData | null>(null);
  const [subvenues, setSubvenues] = useState<SubvenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await venueOwnerApi.getMyVenues();
        if (res.success && res.data && res.data.length > 0) {
          const v = res.data[0];
          setVenue(v);
          if (v._id) {
            const subRes = await venueOwnerApi.getSubvenues(v._id);
            if (subRes.success) {
              setSubvenues(subRes.data || []);
            }
          }
        }
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load overview data",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "venue-owner") {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
        <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />
        <p className="text-xs text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="bg-card rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-border text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Building size={32} />
        </div>
        <h2 className="text-xl font-bold">No Venue Profile Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Create your venue profile to start adding subvenues, scheduling slots,
          and accepting bookings.
        </p>
        <button
          type="button"
          onClick={() => onSwitchTab?.("profile")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-sm"
        >
          Set Up Venue Profile
        </button>
      </div>
    );
  }

  const location = [
    venue.location?.address,
    venue.location?.city,
    venue.location?.state,
    venue.location?.country,
    venue.location?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      {/* Venue Profile Card */}
      <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shadow-inner shrink-0">
            {venue.images && venue.images.length > 0 ? (
              <img
                src={venue.images[0]}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building size={36} className="text-foreground/40" />
            )}
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {venue.name}
              </h1>
            </div>

            {location ? (
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={13} /> {location}
              </p>
            ) : null}

            {venue.sports && venue.sports.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {venue.sports.map((sport) => (
                  <span
                    key={sport}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Bio/Description */}
        <div className="border-t border-border pt-5 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            About This Venue
          </h2>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
            {venue.description}
          </p>
        </div>

        {/* Facilities */}
        {venue.facilities && venue.facilities.length > 0 ? (
          <div className="border-t border-border pt-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Facilities
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {venue.facilities.map((facility) => (
                <span
                  key={facility}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Subvenues List */}
      <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Your Subvenues</h2>
            <p className="text-xs text-muted-foreground">
              Courts, pitches, and fields in your venue
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSwitchTab?.("slots")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
          >
            <Plus size={14} /> Add Subvenue / Slots
          </button>
        </div>

        {subvenues.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Building size={22} />
            </div>
            <h3 className="text-sm font-bold">No Subvenues Added Yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Add subvenues (e.g. Court 1, Pitch A) under the Slots & Schedule
              tab to start creating slots.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subvenues.map((subvenue) => (
              <SubvenueCard
                key={subvenue._id}
                subvenue={subvenue}
                onSelect={() => onSwitchTab?.("slots")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
