import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  X,
  ChevronDown,
} from "lucide-react";
import PageButtons from "../../../components/ui/PageButtons";
import { toast } from "react-toastify";
import {
  coachApi,
  type CoachProfileData,
  type CoachSearchFilters,
} from "../api/coach.api";
import CoachCard from "../cards/CoachCard";
import { SPORTS } from "../../../constants/sportOptions";

export default function CoachListPage() {
  const [coaches, setCoaches] = useState<CoachProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // Search filter states
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const [minExperience, setMinExperience] = useState<number | "">("");

  // Filter dropdown state
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const getFilters = (): CoachSearchFilters => ({
    sport: sport.trim() ? sport.trim() : undefined,
    city: city.trim() ? city.trim() : undefined,
    minExperience: minExperience === "" ? undefined : Number(minExperience),
  });

  const fetchCoaches = async () => {
    setLoading(true);
    setCurrentPage(1);
    setCursorHistory([undefined]);
    try {
      const res = await coachApi.searchProfiles(getFilters());
      if (res.success) {
        setCoaches(res.data);
        setNextCursor(res.pagination.lastCoachId || null);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to search coaches");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCoaches();
  };

  const handleResetFilters = async () => {
    setSport("");
    setCity("");
    setMinExperience("");
    setLoading(true);
    setCurrentPage(1);
    setCursorHistory([undefined]);
    try {
      const res = await coachApi.searchProfiles({});
      if (res.success) {
        setCoaches(res.data);
        setNextCursor(res.pagination.lastCoachId || null);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch coaches");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasNext || !nextCursor || loadingPage) return;
    const newPage = currentPage + 1;
    const updatedHistory = [...cursorHistory];
    updatedHistory[newPage - 1] = nextCursor;
    setCursorHistory(updatedHistory);
    setCurrentPage(newPage);
    setLoadingPage(true);
    try {
      const res = await coachApi.searchProfiles({ ...getFilters(), lastCoachId: nextCursor });
      if (res.success) {
        setCoaches(res.data);
        setNextCursor(res.pagination.lastCoachId || null);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load next page");
    } finally {
      setLoadingPage(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || loadingPage) return;
    const prevPage = currentPage - 1;
    const prevCursor = cursorHistory[prevPage - 1];
    setCurrentPage(prevPage);
    setLoadingPage(true);
    try {
      const res = await coachApi.searchProfiles({ ...getFilters(), lastCoachId: prevCursor });
      if (res.success) {
        setCoaches(res.data);
        setNextCursor(res.pagination.lastCoachId || null);
        setHasNext(res.pagination.hasNext);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load previous page");
    } finally {
      setLoadingPage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Search & Filter Bar */}
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
                  {/* Sport */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sport
                    </label>

                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                    >
                      <option value="">Any sport</option>
                      {SPORTS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
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
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Min Experience (Years)
                    </label>

                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={minExperience}
                      onChange={(e) =>
                        setMinExperience(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder="e.g. 2"
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
                    Search Coaches
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Coaches Grid */}
        {loading ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
            <Loader2
              className="animate-spin text-primary mx-auto mb-3"
              size={32}
            />

            <p className="text-sm text-muted-foreground">
              Discovering coaches...
            </p>
          </div>
        ) : coaches.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Filter size={24} />
            </div>

            <h3 className="text-lg font-bold">No Coaches Found</h3>

            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn't find any coaches matching your search criteria. Try
              modifying your filters.
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
            {/* Coaches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <CoachCard key={coach.coachId} coach={coach} />
              ))}
            </div>

            <PageButtons
              currentPage={currentPage}
              hasNext={hasNext}
              loading={loadingPage}
              onPrevious={handlePrevPage}
              onNext={handleNextPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
