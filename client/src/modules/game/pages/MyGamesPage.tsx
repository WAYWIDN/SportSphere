import { useState, useEffect } from "react";
import { Loader2, Trophy, Users } from "lucide-react";
import { toast } from "react-toastify";
import PageButtons from "../../../components/ui/PageButtons";
import { gameApi, type GameData } from "../api/game.api";
import GameCard from "../cards/GameCard";
import { useAuth } from "../../../context/AuthContext";

export default function MyGamesPage() {
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

  useEffect(() => {
    loadGames(undefined, true);
  }, []);

  const loadGames = async (cursor?: string, initial = false) => {
    if (initial) setLoading(true);
    else setLoadingPage(true);

    try {
      const res = await gameApi.getMyGames(cursor);

      if (!res.success) return false;

      setGames(res.data || []);
      setNextCursor(res.pagination?.lastGameId || null);
      setHasNext(res.pagination?.hasNext || false);

      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load games");
      return false;
    } finally {
      if (initial) setLoading(false);
      else setLoadingPage(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasNext || !nextCursor || loadingPage) return;

    const cursor = nextCursor;

    if (await loadGames(cursor)) {
      setCursorHistory((prev) => {
        const updated = [...prev];
        updated[currentPage] = cursor;
        return updated;
      });

      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || loadingPage) return;

    if (await loadGames(cursorHistory[currentPage - 2])) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const hostedGames = games.filter(
    (game) => user && game.creatorId._id === user.id,
  );

  const joinedGames = games.filter((game) => {
    if (!user) return false;

    const isHost = game.creatorId._id === user.id;

    const isJoined = game.acceptedPlayerIds.some(
      (player) => player._id === user.id,
    );

    return !isHost && isJoined;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {loading ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
            <Loader2
              className="animate-spin text-primary mx-auto mb-3"
              size={32}
            />
            <p className="text-sm text-muted-foreground">Loading games...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hosting */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Trophy size={18} className="text-primary" />
                Hosting ({hostedGames.length})
              </h2>

              {hostedGames.length === 0 ? (
                <div className="bg-card rounded-[2rem] p-8 border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    You're not hosting any games.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostedGames.map((game) => (
                    <GameCard
                      key={game._id}
                      game={game}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Joined */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Users size={18} className="text-primary" />
                Joined ({joinedGames.length})
              </h2>

              {joinedGames.length === 0 ? (
                <div className="bg-card rounded-[2rem] p-8 border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    You haven't joined any games.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedGames.map((game) => (
                    <GameCard
                      key={game._id}
                      game={game}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
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
