import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";

export default function AccessDeniedCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
        <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold">Venue Owner Access Only</h2>
        <p className="text-sm text-muted-foreground">
          This dashboard is dedicated to verified venue owners. If you are a player,
          you can apply to become a venue owner in your profile settings.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
        >
          Go to Profile
        </Link>
      </div>
    </div>
  );
}