import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-black/10 bg-white/70 px-4 py-3 shadow-[0_12px_40px_rgba(18,20,20,0.08)] backdrop-blur-xl sm:px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2"
          aria-label="Go to home"
        >
          <img
            src="/logo.png"
            alt="Sportsphere"
            className="h-8 w-8 object-contain mix-blend-multiply"
          />

          <span className="text-lg font-semibold tracking-[-0.04em] text-black">
            sportsphere
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 text-sm text-black/65 md:flex">
          <button
            type="button"
            onClick={() => handleNavigate("/venues")}
            className="transition hover:text-black"
          >
            Venues
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/coaches")}
            className="transition hover:text-black"
          >
            Coaches
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/games")}
            className="transition hover:text-black"
          >
            Games
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => handleNavigate("/login")}
            className="rounded-full px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/register")}
            className="rounded-full bg-[#111315] px-5 py-2.5 text-sm font-medium text-[#f5f4f1] transition hover:bg-black/80"
          >
            Join sportsphere
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full p-2 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-black/10 bg-white/90 p-4 shadow-xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <button
              type="button"
              onClick={() => handleNavigate("/games")}
              className="text-left transition hover:text-black"
            >
              Find a game
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/venues")}
              className="text-left transition hover:text-black"
            >
              Explore venues
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/coaches")}
              className="text-left transition hover:text-black"
            >
              Meet coaches
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/register")}
              className="mt-2 rounded-full bg-[#111315] px-4 py-2 text-white"
            >
              Join sportsphere
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
