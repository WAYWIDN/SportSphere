import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  X,
  ChevronDown,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";
import PageButtons from "../../../components/ui/PageButtons";
import {
  gameApi,
  type GameData,
  type GameSearchFilters,
} from "../api/game.api";
import GameCard from "../cards/GameCard";
import { useAuth } from "../../../context/AuthContext";

export default function GameListPage() {
  const { user } = useAuth();

  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // Filters
  const [subvenueName, setSubvenueName] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"forming" | "ready" | "">("");
  const [minPlayers, setMinPlayers] = useState<number | "">("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const getFilters = (): GameSearchFilters => ({
    subvenueName: subvenueName.trim() ? subvenueName.trim() : undefined,
    sport: sport.trim() ? sport.trim() : undefined,
    date: date.trim() ? date.trim() : undefined,
    status: status ? status : undefined,
    minPlayers: minPlayers !== "" ? Number(minPlayers) : undefined,
  });

  const fetchGames = async () => {
    setLoading(true);
    setCurrentPage(1);
    setCursorHistory([undefined]);
    try {
      const res = await gameApi.searchGames(getFilters());
      if (res.success) {
        setGames(res.data || []);
        setNextCursor(res.pagination?.lastGameId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames();
  };

  const handleResetFilters = async () => {
    setSubvenueName("");
    setSport("");
    setDate("");
    setStatus("");
    setMinPlayers("");
    setLoading(true);
    setCurrentPage(1);
    setCursorHistory([undefined]);
    try {
      const res = await gameApi.searchGames({});
      if (res.success) {
        setGames(res.data || []);
        setNextCursor(res.pagination?.lastGameId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load games");
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
      const res = await gameApi.searchGames({
        ...getFilters(),
        lastGameId: nextCursor,
      });
      if (res.success) {
        setGames(res.data || []);
        setNextCursor(res.pagination?.lastGameId || null);
        setHasNext(res.pagination?.hasNext || false);
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
      const res = await gameApi.searchGames({
        ...getFilters(),
        lastGameId: prevCursor,
      });
      if (res.success) {
        setGames(res.data || []);
        setNextCursor(res.pagination?.lastGameId || null);
        setHasNext(res.pagination?.hasNext || false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load previous page",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Search & Filter Bar */}
        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/30 transition"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="text-sm font-semibold">
                Search &amp; Filters
              </span>
            </div>

            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                filtersOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {filtersOpen && (
            <div className="px-6 pb-6">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Subvenue */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Subvenue
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={subvenueName}
                        onChange={(e) => setSubvenueName(e.target.value)}
                        placeholder="e.g. Court 1, Arena A"
                        className="w-full px-4 py-2.5 pr-8 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                      />
                      {subvenueName && (
                        <button
                          type="button"
                          onClick={() => setSubvenueName("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition cursor-pointer"
                          title="Clear subvenue filter"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sport */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sport
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        placeholder="e.g. Badminton, Football"
                        className="w-full px-4 py-2.5 pr-8 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                      />
                      {sport && (
                        <button
                          type="button"
                          onClick={() => setSport("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition cursor-pointer"
                          title="Clear sport filter"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition cursor-pointer"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Game Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "forming" | "ready" | "")
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                    >
                      <option value="">All Statuses</option>
                      <option value="forming">Forming (Joining)</option>
                      <option value="ready">Ready to Book</option>
                    </select>
                  </div>

                  {/* Max Min Players with Clear */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Max Min Players
                      </label>
                      {minPlayers !== "" && (
                        <button
                          type="button"
                          onClick={() => setMinPlayers("")}
                          className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={minPlayers}
                        onChange={(e) =>
                          setMinPlayers(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        placeholder="e.g. 4"
                        className="w-full px-4 py-2.5 pr-8 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition"
                      />
                      {minPlayers !== "" && (
                        <button
                          type="button"
                          onClick={() => setMinPlayers("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition cursor-pointer"
                          title="Clear min players filter"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
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
                    Search Games
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
            <Loader2
              className="animate-spin text-primary mx-auto mb-3"
              size={32}
            />
            <p className="text-sm text-muted-foreground">
              Finding active games...
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Trophy size={24} />
            </div>
            <h3 className="text-lg font-bold">No Games Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No games currently match your search criteria. Visit a venue to
              host a new game on any slot!
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
              {games.map((game) => (
                <GameCard key={game._id} game={game} currentUserId={user?.id} />
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
