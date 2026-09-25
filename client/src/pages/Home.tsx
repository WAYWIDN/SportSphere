import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

const games = [
  {
    sport: "Football",
    title: "Evening football",
    place: "Riverside Arena",
    time: "Today at 6:30 PM",
    players: "7 spots open",
    tone: "dark",
  },
  {
    sport: "Basketball",
    title: "Court time",
    place: "Northside Sports Hall",
    time: "Tomorrow at 7:00 PM",
    players: "3 spots open",
    tone: "light",
  },
  {
    sport: "Tennis",
    title: "Tennis doubles",
    place: "Cedar Club",
    time: "Saturday at 9:00 AM",
    players: "1 spot open",
    tone: "warm",
  },
];

const coaches = [
  {
    name: "Maya Patel",
    sport: "Tennis coach",
    city: "Cedar Club",
    initials: "MP",
  },
  {
    name: "Arjun Singh",
    sport: "Football coach",
    city: "Riverside Arena",
    initials: "AS",
  },
  {
    name: "Noah Williams",
    sport: "Basketball coach",
    city: "Northside Hall",
    initials: "NW",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

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
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <VenueCard
              name="Riverside Arena"
              place="Brookfield"
              sports="Football, Cricket"
              image="bg-[#dedbd1]"
            />

            <VenueCard
              name="Cedar Club"
              place="West End"
              sports="Tennis, Badminton"
              image="bg-[#d5d8d4]"
            />
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
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.title} game={game} />
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
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {coaches.map((coach) => (
              <div
                key={coach.name}
                className="flex items-center gap-4 rounded-3xl border border-black/10 bg-white/55 p-5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111315] text-sm font-semibold text-white">
                  {coach.initials}
                </div>

                <div>
                  <p className="font-medium">{coach.name}</p>

                  <p className="mt-1 text-sm text-black/55">{coach.sport}</p>

                  <p className="mt-2 flex items-center gap-1 text-xs text-black/45">
                    <MapPin size={12} /> {coach.city}
                  </p>
                </div>
              </div>
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
}: {
  eyebrow: string;
  title: string;
  action: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[.18em] text-black/45">
          {eyebrow}
        </p>

        <h2 className="text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
          {title}
        </h2>
      </div>

      <button className="inline-flex items-center gap-2 text-sm font-medium text-black/60 transition hover:text-black">
        {action} <ArrowUpRight size={16} />
      </button>
    </div>
  );
}

function GameCard({ game }: { game: (typeof games)[number] }) {
  return (
    <article
      className={`rounded-3xl p-6 ${
        game.tone === "dark"
          ? "bg-[#292d2d]"
          : game.tone === "warm"
            ? "bg-[#d8d1c1] text-[#111315]"
            : "bg-[#f5f4f1] text-[#111315]"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-full border border-current/15 px-3 py-1 text-xs opacity-60">
          {game.sport}
        </span>

        <ArrowUpRight size={18} className="opacity-60" />
      </div>

      <div className="mt-24">
        <h3 className="text-2xl font-medium tracking-[-.04em]">{game.title}</h3>

        <p className="mt-2 text-sm opacity-60">{game.place}</p>

        <div className="mt-6 flex items-center justify-between border-t border-current/10 pt-4 text-xs opacity-60">
          <span>{game.time}</span>
          <span>{game.players}</span>
        </div>
      </div>
    </article>
  );
}

function VenueCard({
  name,
  place,
  sports: sportText,
  image,
}: {
  name: string;
  place: string;
  sports: string;
  image: string;
}) {
  return (
    <article
      className={`group relative min-h-72 overflow-hidden rounded-[2rem] ${image} p-6`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex justify-end">
          <span className="rounded-full bg-white/65 p-2 opacity-0 transition group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className="text-white">
          <p className="text-sm text-white/70">{place}</p>

          <h3 className="mt-1 text-3xl font-medium tracking-[-.05em]">
            {name}
          </h3>

          <p className="mt-2 text-sm text-white/70">{sportText}</p>
        </div>
      </div>
    </article>
  );
}
