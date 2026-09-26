import { CheckCircle } from "lucide-react";

interface VerifiedPartnerCardProps {
  role: string;
}

export default function VerifiedPartnerCard({ role }: VerifiedPartnerCardProps) {
  function getRoleTitle(): string {
    if (role === "coach") return "Coach Account";
    if (role === "venue-owner") return "Venue Owner Account";
    return "Administrator";
  }

  function getRoleDescription(): string {
    if (role === "coach") return "training programs and coaching bookings";
    if (role === "venue-owner") return "sports venues and court reservations";
    return "platform administration";
  }

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border">
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-2">
        <CheckCircle size={18} />
        Verified Partner
      </div>
      <h3 className="text-lg font-bold tracking-tight">{getRoleTitle()}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        Your account has full management privileges for {getRoleDescription()}.
      </p>
    </div>
  );
}
