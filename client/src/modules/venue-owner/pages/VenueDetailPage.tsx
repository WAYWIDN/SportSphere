import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Building,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type VenueProfileData,
  type SubvenueData,
} from "../api/venueOwner.api";
import SubvenueCard from "../cards/SubvenueCard";

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();

  const [venue, setVenue] = useState<VenueProfileData | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);

  const [subvenues, setSubvenues] = useState<SubvenueData[]>([]);
  const [loadingSubvenues, setLoadingSubvenues] = useState(false);

  // Fetch venue details
  useEffect(() => {
    if (!venueId) {
      toast.error("Invalid venue ID");
      setLoadingVenue(false);
      return;
    }

    const fetchVenue = async () => {
      setLoadingVenue(true);
      try {
        const res = await venueOwnerApi.getVenue(venueId);
        if (res.success && res.data) {
          setVenue(res.data);
        } else {
          setVenue(null);
        }
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load venue details",
        );
        setVenue(null);
      } finally {
        setLoadingVenue(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  // Fetch subvenues when venue loads
  useEffect(() => {
    if (!venue || !venue._id) return;

    const fetchSubvenues = async () => {
      try {
        setLoadingSubvenues(true);
        const res = await venueOwnerApi.getSubvenues(venue._id);
        if (res.success) {
          const list = res.data || [];
          setSubvenues(list);
        }
        setLoadingSubvenues(false);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load subvenues");
        setLoadingSubvenues(false);
      }
    };

    fetchSubvenues();
  }, [venue]);

  if (loadingVenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground font-medium">
            Loading venue details...
          </p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold">Venue Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The venue you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/venues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft size={14} />
            Browse Venues
          </Link>
        </div>
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
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back navigation */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer bg-card shadow-sm"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

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

                {venue.sports && venue.sports.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
                    <Trophy size={13} />
                    {venue.sports.length}{" "}
                    {venue.sports.length === 1 ? "sport" : "sports"}
                  </span>
                ) : null}
              </div>

              {location ? (
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={13} />
                  {location}
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

          {/* Description */}
          <div className="border-t border-border pt-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              About This Venue
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Facilities */}
          {venue.facilities && venue.facilities.length > 0 && (
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
          )}

          {/* Photos */}
          {venue.images && venue.images.length > 1 ? (
            <div className="border-t border-border pt-5 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-full h-40 rounded-2xl overflow-hidden border border-border bg-muted"
                  >
                    <img
                      src={image}
                      alt={`Court image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Available Slots Section */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Available Courts / Subvenues
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a court to book a playing session
              </p>
            </div>
          </div>

          {loadingSubvenues ? (
            <div className="py-12 text-center">
              <Loader2
                className="animate-spin text-primary mx-auto mb-2"
                size={28}
              />
              <p className="text-xs text-muted-foreground">
                Loading subvenues...
              </p>
            </div>
          ) : subvenues.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Building size={22} />
              </div>
              <h3 className="text-sm font-bold">No Courts Available</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                This venue has not added any subvenues/courts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subvenues.map((sv) => (
                <SubvenueCard
                  key={sv._id}
                  subvenue={sv}
                  onSelect={() => {
                    // Navigate to subvenue detail page
                    navigate(`/venues/${venueId}/subvenues/${sv._id}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
