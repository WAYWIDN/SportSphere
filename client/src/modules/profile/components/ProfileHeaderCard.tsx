import {
  User as UserIcon,
  Mail,
  MapPin,
  Camera,
  Loader2,
  Briefcase,
  Building,
  Shield,
} from "lucide-react";

interface ProfileHeaderCardProps {
  fullName: string;
  email: string;
  city: string;
  state: string;
  profilePictureUrl: string;
  firstName: string;
  role: string;
  uploadingImage: boolean;
  onUploadClick: () => void;
}

function getRoleBadge(roleName: string) {
  switch (roleName) {
    case "coach":
      return {
        label: "Coach",
        color: "bg-black-500/10 text-white-700 border-black-500/20",
        icon: <Briefcase size={14} />,
      };
    case "venue-owner":
      return {
        label: "Venue Owner",
        color: "bg-black-500/10 text-white-700 border-black-500/20",
        icon: <Building size={14} />,
      };
    case "admin":
      return {
        label: "Administrator",
        color: "bg-black-500/10 text-white-700 border-black-500/20",
        icon: <Shield size={14} />,
      };
    default:
      return {
        label: "Player",
        color: "bg-primary/10 text-foreground border-border",
        icon: <UserIcon size={14} />,
      };
  }
}

export default function ProfileHeaderCard({
  fullName,
  email,
  city,
  state,
  profilePictureUrl,
  firstName,
  role,
  uploadingImage,
  onUploadClick,
}: ProfileHeaderCardProps) {
  const roleBadge = getRoleBadge(role);
  let avatarLetter = "U";
  if (firstName) {
    avatarLetter = firstName[0].toUpperCase();
  } else if (email) {
    avatarLetter = email[0].toUpperCase();
  }

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Profile Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shadow-inner">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl font-semibold text-foreground/40">
                  {avatarLetter}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onUploadClick}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 transition cursor-pointer"
              title="Upload profile picture"
              aria-label="Upload profile picture"
            >
              {uploadingImage ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{fullName}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}
              >
                {roleBadge.icon}
                {roleBadge.label}
              </span>
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={15} />
              {email}
            </p>

            {(city || state) && (
              <p className="text-xs text-muted-foreground/80 flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={13} />
                {[city, state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
