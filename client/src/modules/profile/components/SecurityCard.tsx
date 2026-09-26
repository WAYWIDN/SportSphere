import { Link } from "react-router";
import { Shield, KeyRound, LogOut } from "lucide-react";

interface SecurityCardProps {
  onLogout: () => void;
}

export default function SecurityCard({ onLogout }: SecurityCardProps) {
  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-4">
      <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
        <Shield size={16} className="text-primary" />
        Security &amp; Account
      </h3>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Protect your account by regularly updating your password and reviewing your profile information.
      </p>

      <div className="pt-2 flex flex-col gap-2">
        <Link
          to="/reset-password"
          className="w-full py-2.5 px-4 rounded-2xl border border-input text-xs font-medium text-center hover:bg-muted transition flex items-center justify-center gap-2"
        >
          <KeyRound size={14} />
          Change Password
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-2xl bg-destructive/10 text-destructive text-xs font-medium text-center hover:bg-destructive/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
