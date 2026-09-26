import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Shield,
  Briefcase,
  Building,
  ArrowLeft,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { profileApi, type UserProfileData } from "../api/profile.api";

export default function UserProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid user ID");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const res = await profileApi.getUserProfileById(userId);
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setProfile(null);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load user profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const getRoleBadge = (roleName?: string) => {
    if (roleName === "coach") {
      return {
        label: "Coach",
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        icon: <Briefcase size={14} />,
      };
    }

    if (roleName === "venue-owner") {
      return {
        label: "Venue Owner",
        color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
        icon: <Building size={14} />,
      };
    }

    if (roleName === "admin") {
      return {
        label: "Administrator",
        color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
        icon: <Shield size={14} />,
      };
    }

    return {
      label: "Player",
      color: "bg-primary/10 text-foreground border-border",
      icon: <UserIcon size={14} />,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground font-medium">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-[2.5rem] border border-border text-center space-y-4 shadow-xl shadow-black/5">
          <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold">Profile Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested user profile does not exist or could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User Profile";
  const roleBadge = getRoleBadge(profile.role);

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Navigation Button */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer bg-card shadow-sm"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shadow-inner shrink-0">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl font-semibold text-foreground/40">
                  {profile.firstName ? profile.firstName[0]?.toUpperCase() : profile.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{fullName}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}
                >
                  {roleBadge.icon}
                  {roleBadge.label}
                </span>
              </div>

              {profile.email ? (
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={15} />
                  {profile.email}
                </p>
              ) : null}

              {(profile.city || profile.state) ? (
                <p className="text-xs text-muted-foreground/80 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={13} />
                  {[profile.city, profile.state].filter(Boolean).join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Detailed Information Card */}
        <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-bold tracking-tight">Profile Details</h2>
            <p className="text-xs text-muted-foreground">
              User details and contact information
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {/* First Name */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                First Name
              </span>
              <p className="font-medium text-foreground">
                {profile.firstName || "Not provided"}
              </p>
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Last Name
              </span>
              <p className="font-medium text-foreground">
                {profile.lastName || "Not provided"}
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Phone size={12} /> Phone Number
              </span>
              <p className="font-medium text-foreground">
                {profile.phoneNumber || "Not provided"}
              </p>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gender
              </span>
              <p className="font-medium text-foreground capitalize">
                {profile.gender || "Not specified"}
              </p>
            </div>

            {/* Age */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Age
              </span>
              <p className="font-medium text-foreground">
                {profile.age ? `${profile.age} years old` : "Not specified"}
              </p>
            </div>

            {/* City */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                City
              </span>
              <p className="font-medium text-foreground">
                {profile.city || "Not provided"}
              </p>
            </div>

            {/* State */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                State / Region
              </span>
              <p className="font-medium text-foreground">
                {profile.state || "Not provided"}
              </p>
            </div>

            {/* Street Address */}
            <div className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Address
              </span>
              <p className="font-medium text-foreground">
                {profile.address || "Not provided"}
              </p>
            </div>

            {/* Account Created At */}
            {profile.createdAt ? (
              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar size={14} />
                <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
