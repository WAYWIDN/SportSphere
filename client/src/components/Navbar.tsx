import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User as UserIcon,
  KeyRound,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  Building,
  Users,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../modules/auth/api/auth.api";
import { toast } from "react-toastify";

const ROLE_BADGES = {
  coach: { label: "Coach", icon: <Briefcase size={12} /> },
  "venue-owner": { label: "Venue Owner", icon: <Building size={12} /> },
  admin: { label: "Admin", icon: <Shield size={12} /> },
  player: { label: "Player", icon: <UserIcon size={12} /> },
};

const ROLE_MENU_ITEMS: Record<string, { label: string; path: string; icon: React.ReactNode }[]> = {
  admin: [{ label: "Admin Portal", path: "/admin", icon: <Shield size={16} /> }],
  coach: [{ label: "Coach Dashboard", path: "/coach/dashboard", icon: <LayoutDashboard size={16} /> }],
  "venue-owner": [{ label: "Venue Owner Portal", path: "/venue-owner", icon: <Building size={16} /> }],
  player: [
    { label: "My Bookings", path: "/bookings", icon: <Calendar size={16} /> },
    { label: "My Games", path: "/my-games", icon: <Users size={16} /> },
  ],
};

const COMMON_MENU_ITEMS = [
  { label: "My Profile", path: "/profile", icon: <UserIcon size={16} /> },
  { label: "Reset Password", path: "/reset-password", icon: <KeyRound size={16} /> },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const roleBadge = ROLE_BADGES[user?.role as keyof typeof ROLE_BADGES] ?? ROLE_BADGES.player;
  const roleItems = ROLE_MENU_ITEMS[user?.role ?? ""] ?? [];
  const menuItems = [...roleItems, ...COMMON_MENU_ITEMS];

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border bg-card/80 px-4 py-3 shadow-[0_12px_40px_rgba(18,20,20,0.08)] backdrop-blur-xl sm:px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2 cursor-pointer"
          aria-label="Go to home"
        >
          <img
            src="/logo.png"
            alt="Sportsphere"
            className="h-8 w-8 object-contain mix-blend-multiply"
          />
          <span className="text-lg font-semibold tracking-[-0.04em] text-foreground">
            sportsphere
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <button
            type="button"
            onClick={() => handleNavigate("/venues")}
            className="transition hover:text-foreground cursor-pointer"
          >
            Venues
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/coaches")}
            className="transition hover:text-foreground cursor-pointer"
          >
            Coaches
          </button>
          <button
            type="button"
            onClick={() => handleNavigate("/games")}
            className="transition hover:text-foreground cursor-pointer"
          >
            Games
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border bg-background/80 hover:bg-muted py-1.5 pl-2 pr-3.5 text-sm font-medium text-foreground transition cursor-pointer shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  <UserIcon size={14} />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-foreground border-border">
                  {roleBadge.icon}
                  {roleBadge.label}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-border bg-card p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-semibold text-foreground capitalize truncate">
                      {user.role || "User"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5 text-sm">
                    {menuItems.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-muted text-foreground transition cursor-pointer text-left"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}

                    <div className="my-1 border-t border-border" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-destructive hover:bg-destructive/10 transition cursor-pointer text-left"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-muted/50 cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => handleNavigate("/register")}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 cursor-pointer shadow-sm"
              >
                Join sportsphere
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full p-2 md:hidden text-foreground hover:bg-muted transition cursor-pointer"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-3 text-sm">
            <button
              type="button"
              onClick={() => handleNavigate("/games")}
              className="text-left transition hover:text-foreground py-1.5 cursor-pointer text-muted-foreground"
            >
              Find a game
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/venues")}
              className="text-left transition hover:text-foreground py-1.5 cursor-pointer text-muted-foreground"
            >
              Explore venues
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/coaches")}
              className="text-left transition hover:text-foreground py-1.5 cursor-pointer text-muted-foreground"
            >
              Meet coaches
            </button>

            <div className="my-1 border-t border-border" />

            {user ? (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">Account</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-muted text-foreground border-border">
                    {roleBadge.icon}
                    {roleBadge.label}
                  </span>
                </div>

                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className="flex items-center gap-2.5 rounded-2xl bg-muted/60 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted text-left cursor-pointer"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/20 cursor-pointer"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigate("/login")}
                  className="rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition hover:bg-muted cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate("/register")}
                  className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90 cursor-pointer"
                >
                  Join sportsphere
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
