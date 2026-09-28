import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { coachApi, type CoachProfileData } from "../modules/coach/api/coach.api";
import { gameApi, type GameData } from "../modules/game/api/game.api";
import {
  venueOwnerApi,
  type VenueProfileData,
} from "../modules/venue-owner/api/venueOwner.api";
import { formatTimeEpoch } from "../utils/formatTime";

const HOME_CACHE_KEY = "sportsphere-home-v2";
const GAME_TONES = ["dark", "light", "warm"] as const;

type HomeCache = {
  coaches: CoachProfileData[];
  venues: VenueProfileData[];
  games: GameData[];
};

type HomeGame = {
  id: string;
  sport: string;
  title: string;
  place: string;
  time: string;
  players: string;
  tone: (typeof GAME_TONES)[number];
  imageUrl: string;
};

type HomeCoach = {
  id: string;
  name: string;
  sport: string;
  city: string;
  initials: string;
  imageUrl: string;
};

type HomeVenue = {
  venueId: string;
  name: string;
  place: string;
  sports: string;
  imageUrl: string;
};

function pickRandom<T>(items: T[], count: number) {
  const pool = [...items];
  const picked: T[] = [];
  const amount = Math.min(count, pool.length);

  for (let index = 0; index < amount; index += 1) {
    const pickIndex = Math.floor(Math.random() * pool.length);
    picked.push(pool[pickIndex]);
    pool.splice(pickIndex, 1);
  }

  return picked;
}

function readHomeCache(): HomeCache | null {
  try {
    const raw = sessionStorage.getItem(HOME_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as HomeCache;
    if (!Array.isArray(parsed.coaches) || !Array.isArray(parsed.venues) || !Array.isArray(parsed.games)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveHomeCache(cache: HomeCache) {
  try {
    sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Failed to store home data:", error);
  }
}

function coachInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0].toUpperCase());
  if (letters.length === 0) {
    return "C";
  }
  return letters.join("");
}

function toHomeCoach(coach: CoachProfileData): HomeCoach {
  const name = coach.coachingCenter?.name || "Coach";
  const sportName = coach.sports[0] || "Sport";
  const imageUrl = coach.profilePictureUrl || coach.photos?.[0] || "";
  return {
    id: coach.coachId,
    name,
    sport: `${sportName} coach`,
    city: coach.coachingCenter?.city || "",
    initials: coachInitials(name),
    imageUrl,
  };
}

function toHomeVenue(venue: VenueProfileData): HomeVenue {
  return {
    venueId: venue._id,
    name: venue.name,
    place: venue.location?.city || "",
    sports: venue.sports.join(", "),
    imageUrl: venue.images?.[0] || "",
  };
}

function toHomeGame(game: GameData, index: number): HomeGame {
  const openSpots = Math.max(
    game.maximumPlayers - game.acceptedPlayerIds.length,
    0,
  );
  const venue = game.subvenueId.venueId;
  const slotLabel = game.slotId.date
    ? `${game.slotId.date} at ${formatTimeEpoch(game.slotId.startEpoch)}`
    : formatTimeEpoch(game.slotId.startEpoch);
  const imageUrl = venue?.images?.[0] || "";

  return {
    id: game._id,
    sport: game.subvenueId.sport || "Sport",
    title: game.subvenueId.name || "Game",
    place: venue?.name || venue?.location?.city || "",
    time: slotLabel,
    players: openSpots === 1 ? "1 spot open" : `${openSpots} spots open`,
    tone: GAME_TONES[index % GAME_TONES.length],
    imageUrl,
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<HomeVenue[]>([]);
  const [games, setGames] = useState<HomeGame[]>([]);
  const [coaches, setCoaches] = useState<HomeCoach[]>([]);

  useEffect(() => {
    let ignore = false;

    const showRandom = (cache: HomeCache) => {
      const pickedVenues = pickRandom(cache.venues, 2);
      const pickedGames = pickRandom(cache.games, 3);
      const pickedCoaches = pickRandom(cache.coaches, 3);
      setVenues(pickedVenues.map(toHomeVenue));
      setGames(pickedGames.map(toHomeGame));
      setCoaches(pickedCoaches.map(toHomeCoach));
    };

    const loadHome = async () => {
      const cached = readHomeCache();
      if (cached) {
        showRandom(cached);
        return;
      }

      try {
        const [coachRes, venueRes, gameRes] = await Promise.all([
          coachApi.searchProfiles({}),
          venueOwnerApi.searchVenues({}),
          gameApi.searchGames({}),
        ]);

        if (ignore) {
          return;
        }

        const cache: HomeCache = {
          coaches: coachRes.success ? coachRes.data.slice(0, 10) : [],
          venues: venueRes.success ? venueRes.data.slice(0, 10) : [],
          games: gameRes.success ? gameRes.data.slice(0, 10) : [],
        };
        saveHomeCache(cache);
        showRandom(cache);
      } catch (error) {
        console.error("Failed to load home data:", error);
      }
    };

    loadHome();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f4f1] text-[#111315]">
      <section
        id="top"
        className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-40 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-28 lg:pt-48"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="max-w-xl text-[clamp(3.5rem,8vw,7.4rem)] font-semibold leading-[.88] tracking-[-0.08em]">
            Play more
            <br />
            <span className="text-black/45 tracking-tight">Feel better</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-black/60 sm:text-lg">
            Find games, book a place to play, and meet people who enjoy sport as
            much as you do.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/games")}
              className="inline-flex items-center gap-2 rounded-full bg-[#111315] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Find a game <ArrowUpRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/venues")}
              className="rounded-full border border-black/15 bg-white/45 px-5 py-3 text-sm font-medium transition hover:bg-white"
            >
              Browse venues
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mr-0">
          <div className="absolute -right-10 top-8 h-64 w-64 rounded-full bg-[#dedbd1] blur-3xl" />

          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-[#151819] p-6 shadow-2xl shadow-black/15 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,.17),transparent_28%),linear-gradient(135deg,transparent_45%,rgba(255,255,255,.07)_45%,transparent_46%)]" />

            <div className="relative flex h-full flex-col justify-between text-white">
              <div className="flex items-center justify-between text-xs uppercase tracking-[.2em] text-white/45">
                <span>Sportsphere</span>
                <Trophy size={18} className="text-[#d9d4c4]" />
              </div>

              <div>
                <p className="text-sm text-white/50">Your sports community</p>

                <p className="mt-3 max-w-xs text-4xl font-medium leading-[.96] tracking-[-.06em] sm:text-5xl">
                  Good games start with good people.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/15 pt-5 text-sm text-white/55">
                <span>Find your people</span>
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-10 lg:px-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<MapPin size={20} />}
            value="Book places"
            text="Play where you like"
          />

          <Stat
            icon={<CalendarDays size={20} />}
            value="Train Well"
            text="Learn from coaches"
          />

          <Stat
            icon={<Users size={20} />}
            value="Find players"
            text="Meet people nearby"
          />
        </div>
      </section>

      <section
        id="venues"
        className="bg-[#e9e8e3] mx-auto px-6 py-24 sm:px-14 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Explore venues"
            title="Places made for play."
            action="View all venues"
            onClick={() => navigate("/venues")}
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard key={venue.venueId} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="games"
        className="bg-[#111315] px-6 py-24 text-[#f5f4f1] sm:px-10 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Find a game"
            title="Your next game is close."
            action="See all games"
            onDark
            onClick={() => navigate("/games")}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="coaches"
        className="border-t border-black/10 bg-[#e9e8e3] px-6 py-24 sm:px-10 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Meet coaches"
            title="Learn from people who play."
            action="View all coaches"
            onClick={() => navigate("/coaches")}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {coaches.map((coach) => (
              <Link
                key={coach.id}
                to={`/coach/${coach.id}`}
                className="flex items-center gap-4 rounded-3xl border border-black/10 bg-white/55 p-5"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#111315] text-sm font-semibold text-white">
                  {coach.imageUrl ? (
                    <img
                      src={coach.imageUrl}
                      alt={coach.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    coach.initials
                  )}
                </div>

                <div>
                  <p className="font-medium">{coach.name}</p>

                  <p className="mt-1 text-sm text-black/55">{coach.sport}</p>

                  <p className="mt-2 flex items-center gap-1 text-xs text-black/45">
                    <MapPin size={12} /> {coach.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  text,
}: {
  icon: React.ReactNode;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/55 p-5">
      <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-full bg-[#111315] text-white">
        {icon}
      </div>

      <p className="font-medium">{value}</p>

      <p className="mt-1 text-sm text-black/50">{text}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
  onClick,
  onDark,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onClick: () => void;
  onDark?: boolean;
}) {
  const muted = onDark ? "text-white/50" : "text-black/45";
  const actionColor = onDark
    ? "text-white/70 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className={`mb-3 text-xs font-medium uppercase tracking-[.18em] ${muted}`}>
          {eyebrow}
        </p>

        <h2
          className={`text-4xl font-semibold tracking-[-.06em] sm:text-5xl ${
            onDark ? "text-[#f5f4f1]" : ""
          }`}
        >
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 text-sm font-medium transition ${actionColor}`}
      >
        {action} <ArrowUpRight size={16} />
      </button>
    </div>
  );
}

function GameCard({ game }: { game: HomeGame }) {
  const toneClass =
    game.tone === "dark"
      ? "bg-[#292d2d] text-[#f5f4f1]"
      : game.tone === "warm"
        ? "bg-[#d8d1c1] text-[#111315]"
        : "bg-[#f5f4f1] text-[#111315]";
  const textClass = game.imageUrl ? "text-white" : toneClass;

  return (
    <Link
      to={`/games/${game.id}`}
      className={`relative block overflow-hidden rounded-3xl p-6 ${textClass}`}
    >
      {game.imageUrl ? (
        <img
          src={game.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {game.imageUrl ? (
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10" />
      ) : null}

      <div className="relative flex items-start justify-between">
        <span className="rounded-full border border-current/15 px-3 py-1 text-xs opacity-80">
          {game.sport}
        </span>

        <ArrowUpRight size={18} className="opacity-80" />
      </div>

      <div className="relative mt-24">
        <h3 className="text-2xl font-medium tracking-[-.04em]">{game.title}</h3>

        <p className="mt-2 text-sm opacity-80">{game.place}</p>

        <div className="mt-6 flex items-center justify-between border-t border-current/15 pt-4 text-xs opacity-80">
          <span>{game.time}</span>
          <span>{game.players}</span>
        </div>
      </div>
    </Link>
  );
}

function VenueCard({ venue }: { venue: HomeVenue }) {
  return (
    <Link
      to={`/venues/${venue.venueId}`}
      className="group relative block min-h-72 overflow-hidden rounded-[2rem] bg-[#dedbd1] p-6"
    >
      {venue.imageUrl ? (
        <img
          src={venue.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />

      <div className="relative flex h-full min-h-60 flex-col justify-between">
        <div className="flex justify-end">
          <span className="rounded-full bg-white/65 p-2 opacity-0 transition group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className="text-white">
          <p className="text-sm text-white/70">{venue.place}</p>

          <h3 className="mt-1 text-3xl font-medium tracking-tighter">
            {venue.name}
          </h3>

          <p className="mt-2 text-sm text-white/70">{venue.sports}</p>
        </div>
      </div>
    </Link>
  );
}
