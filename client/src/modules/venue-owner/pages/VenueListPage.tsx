import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type VenueProfileData,
  type VenueSearchFilters,
} from "../api/venueOwner.api";
import VenueCard from "../cards/VenueCard";

export default function VenueListPage() {
  const [venues, setVenues] = useState<VenueProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVenueId, setLastVenueId] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // Search filter states
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");

  // Filter dropdown state
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);

    try {
      const filters: VenueSearchFilters = {
        name: name.trim() ? name.trim() : undefined,
        sport: sport.trim() ? sport.trim() : undefined,
        city: city.trim() ? city.trim() : undefined,
      };

      const res = await venueOwnerApi.searchVenues(filters);

      if (res.success) {
        setVenues(res.data || []);
        setLastVenueId(res.pagination?.lastVenueId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to search venues");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVenues();
  };

  const handleResetFilters = async () => {
    setName("");
    setSport("");
    setCity("");

    setLoading(true);

    try {
      const res = await venueOwnerApi.searchVenues({});

      if (res.success) {
        setVenues(res.data || []);
        setLastVenueId(res.pagination?.lastVenueId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!lastVenueId || loadingMore) return;

    setLoadingMore(true);

    try {
      const filters: VenueSearchFilters = {
        name: name.trim() ? name.trim() : undefined,
        sport: sport.trim() ? sport.trim() : undefined,
        city: city.trim() ? city.trim() : undefined,
        lastVenueId,
      };

      const res = await venueOwnerApi.searchVenues(filters);

      if (res.success) {
        setVenues((prev) => [...prev, ...(res.data || [])]);
        setLastVenueId(res.pagination?.lastVenueId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load more venues");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Search & Filter Bar matching CoachListPage */}
        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          {/* Filter Header */}
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/30 transition"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="text-sm font-semibold">Search & Filters</span>
            </div>

            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                filtersOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Filters */}
          {filtersOpen && (
            <div className="px-6 pb-6">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Venue Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Apex Arena"
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                    />
                  </div>

                  {/* Sport */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sport
                    </label>
                    <input
                      type="text"
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      placeholder="e.g. Football, Badminton"
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, New York"
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  >
                    <X size={13} />
                    Reset Filters
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Search size={14} />
                    Search Venues
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Venues Grid */}
        {loading ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
            <Loader2
              className="animate-spin text-primary mx-auto mb-3"
              size={32}
            />
            <p className="text-sm text-muted-foreground">
              Discovering venues...
            </p>
          </div>
        ) : venues.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Filter size={24} />
            </div>

            <h3 className="text-lg font-bold">No Venues Found</h3>

            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn't find any venues matching your search criteria. Try modifying your filters.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
            >
              <RefreshCw size={13} />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <VenueCard key={venue._id} venue={venue} />
              ))}
            </div>

            {hasNext && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="px-6 py-3 rounded-full border border-border text-xs font-semibold bg-card hover:bg-muted transition cursor-pointer inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Loading more venues...
                    </>
                  ) : (
                    "Load More Venues"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}