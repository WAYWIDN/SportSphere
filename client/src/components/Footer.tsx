export default function Footer() {
  return (
    <footer className="bg-[#111315] px-6 py-8 text-white/55 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Sportsphere"
            className="h-7 w-7 object-contain brightness-0 invert"
          />

          <span className="font-bold font-xl tracking-[-0.02em]">sportsphere</span>
        </div>

        {/* Tagline */}
        <p className="text-white/45">Play Connect Repeat</p>
      </div>
    </footer>
  );
}
