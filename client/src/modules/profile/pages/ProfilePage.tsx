import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { profileApi, type UserProfileData } from "../api/profile.api";
import { authApi } from "../../auth/api/auth.api";
import { useAuth } from "../../../context/AuthContext";
import { uploadFile } from "../../../service/cloudinary";

import ProfileHeaderCard from "../components/ProfileHeaderCard";
import PersonalDetailsForm from "../components/PersonalDetailsForm";
import RoleApplicationCard from "../components/RoleApplicationCard";
import VerifiedPartnerCard from "../components/VerifiedPartnerCard";
import SecurityCard from "../components/SecurityCard";

export default function ProfilePage() {
  const { user, setUser, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [age, setAge] = useState<number | "">("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Application state
  const [applyRole, setApplyRole] = useState<"coach" | "venue-owner">("coach");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [applying, setApplying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const res = await profileApi.getUserProfile();

      if (res.success && res.data) {
        setProfile(res.data);
        setFirstName(res.data.firstName || "");
        setLastName(res.data.lastName || "");
        setPhoneNumber(res.data.phoneNumber || "");
        setGender(res.data.gender || "");
        setAge(res.data.age ?? "");
        setAddress(res.data.address || "");
        setCity(res.data.city || "");
        setState(res.data.state || "");
        setProfilePictureUrl(res.data.profilePictureUrl || "");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Always send the complete current profile
  const getProfileData = (newProfilePictureUrl?: string) => ({
    firstName,
    lastName,
    phoneNumber,
    gender: gender || undefined,
    age: age === "" ? undefined : Number(age),
    address,
    city,
    state,
    profilePictureUrl:
      newProfilePictureUrl !== undefined
        ? newProfilePictureUrl
        : profilePictureUrl,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploadingImage(true);

    try {
      const url = await uploadFile(file);
      setProfilePictureUrl(url);
      // Send all existing values + new profile picture
      await profileApi.updateUserProfile(getProfileData(url));
      toast.success("Profile picture updated!");
      await fetchProfile();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to upload image",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      const res = await profileApi.updateUserProfile(getProfileData());
      if (res.success) {
        toast.success("Profile updated successfully!");
        setProfile(res.data);
        await checkAuth();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentFile) {
      toast.error(
        "Please upload a verification document (ID or Certification)",
      );
      return;
    }

    setApplying(true);

    try {
      setUploadingDoc(true);
      const documentUrl = await uploadFile(documentFile);
      setUploadingDoc(false);
      const res = await profileApi.applyForCoachOrVenueOwner({
        role: applyRole,
        documentUrl,
      });

      if (res.success) {
        toast.success(res.message || "Application submitted successfully!");
        setDocumentFile(null);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit application",
      );
    } finally {
      setUploadingDoc(false);
      setApplying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      setUser(null);
      navigate("/login");
    }
  };

  const role = profile?.role || user?.role || "player";

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Sports Enthusiast";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />

          <p className="text-sm text-muted-foreground font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        {/* Profile Header */}
        <ProfileHeaderCard
          fullName={fullName}
          email={profile?.email || ""}
          city={city}
          state={state}
          profilePictureUrl={profilePictureUrl}
          firstName={firstName}
          role={role}
          uploadingImage={uploadingImage}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit Profile Form */}
          <PersonalDetailsForm
            email={profile?.email || ""}
            firstName={firstName}
            lastName={lastName}
            phoneNumber={phoneNumber}
            gender={gender}
            age={age}
            address={address}
            city={city}
            state={state}
            saving={saving}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onPhoneNumberChange={setPhoneNumber}
            onGenderChange={setGender}
            onAgeChange={setAge}
            onAddressChange={setAddress}
            onCityChange={setCity}
            onStateChange={setState}
            onSubmit={handleSaveProfile}
          />

          {/* Right Sidebar */}
          <div className="space-y-6">
            {role === "player" ? (
              <RoleApplicationCard
                applyRole={applyRole}
                documentFile={documentFile}
                applying={applying}
                uploadingDoc={uploadingDoc}
                onApplyRoleChange={setApplyRole}
                onDocumentFileChange={setDocumentFile}
                onSubmit={handleApply}
              />
            ) : (
              <VerifiedPartnerCard role={role} />
            )}

            <SecurityCard onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  );
}
