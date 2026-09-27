import { Building, Loader2, CheckCircle2, ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { coachApi, type CoachProfileData } from "../api/coach.api";
import { useAuth } from "../../../context/AuthContext";
import { uploadFile } from "../../../service/cloudinary";

export default function CoachProfileForm() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<CoachProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState<number | "">("");
  const [sportsInput, setSportsInput] = useState("");

  const [centerName, setCenterName] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerCity, setCenterCity] = useState("");
  const [centerState, setCenterState] = useState("");

  // New training center images
  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Existing training center images marked for deletion
  const [removedExistingImageIndices, setRemovedExistingImageIndices] =
    useState<number[]>([]);

  const existingImages = profile?.photos || [];

  const inputClasses =
    "w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition";

  const labelClasses =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  const fetchMyProfile = async (coachId: string) => {
    setLoadingProfile(true);

    try {
      const res = await coachApi.getProfile(coachId);

      if (res.success && res.data) {
        setProfile(res.data);
        setBio(res.data.bio || "");
        setExperience(res.data.experience ?? "");
        setSportsInput(res.data.sports ? res.data.sports.join(", ") : "");
        setCenterName(res.data.coachingCenter?.name || "");
        setCenterAddress(res.data.coachingCenter?.address || "");
        setCenterCity(res.data.coachingCenter?.city || "");
        setCenterState(res.data.coachingCenter?.state || "");
      }
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "coach" && user.id) {
      fetchMyProfile(user.id);
    }
  }, [user]);

  // Create previews for newly selected files
  useEffect(() => {
    const urls = profileImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [profileImages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const currentExistingCount =
      existingImages.length - removedExistingImageIndices.length;
    const availableSlots = 5 - currentExistingCount - profileImages.length;
    const newFiles = imageFiles.slice(0, Math.max(0, availableSlots));

    setProfileImages((prev) => [...prev, ...newFiles]);

    e.target.value = "";
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setRemovedExistingImageIndices((prev) =>
        prev.includes(index) ? prev : [...prev, index],
      );
    } else {
      setProfileImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const sportsList = sportsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (sportsList.length === 0) {
      toast.error("Please enter at least one sport");
      return;
    }

    if (experience === "") {
      toast.error("Please enter years of experience");
      return;
    }

    setSavingProfile(true);

    try {
      // Upload newly selected training center images
      const newImageUrls = await Promise.all(
        profileImages.map(async (file) => {
          try {
            return await uploadFile(file);
          } catch (err: any) {
            toast.error(
              err.response?.data?.message ||
                err.message ||
                "Failed to upload image",
            );

            return "";
          }
        }),
      );

      const validNewImageUrls = newImageUrls.filter(Boolean);

      // Keep existing images that were not removed
      const remainingExistingImages = existingImages.filter(
        (_, index) => !removedExistingImageIndices.includes(index),
      );

      // Final list of training center photos
      const allImages = [...remainingExistingImages, ...validNewImageUrls];

      const payload = {
        bio,
        experience: Number(experience),
        sports: sportsList,

        coachingCenter: {
          name: centerName,
          address: centerAddress,
          city: centerCity,
          state: centerState,
        },

        photos: allImages,
      };

      if (profile) {
        const res = await coachApi.updateProfile(payload);

        if (res.success) {
          toast.success("Coach profile updated successfully!");
          setProfile(res.data);
          // Clear temporary image state
          setProfileImages([]);
          setRemovedExistingImageIndices([]);
        }
      } else {
        const res = await coachApi.createProfile(payload);

        if (res.success) {
          toast.success("Coach profile created successfully!");
          setProfile(res.data);
          setProfileImages([]);
          setRemovedExistingImageIndices([]);
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save coach profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const totalImages =
    existingImages.length -
    removedExistingImageIndices.length +
    profileImages.length;

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold tracking-tight">
          {profile ? "Edit Coach Profile" : "Set Up Coach Profile"}
        </h2>

        <p className="text-xs text-muted-foreground">
          Tell athletes about your coaching background, sports, and training
          center
        </p>
      </div>

      {loadingProfile ? (
        <div className="py-12 text-center">
          <Loader2
            className="animate-spin text-primary mx-auto mb-2"
            size={28}
          />

          <p className="text-xs text-muted-foreground">Loading profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClasses}>
                Sports Coached (Comma-separated)
              </label>

              <input
                type="text"
                value={sportsInput}
                onChange={(e) => setSportsInput(e.target.value)}
                placeholder="Football, Tennis, Basketball"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Experience (Years)</label>

              <input
                type="number"
                min={0}
                max={50}
                value={experience}
                onChange={(e) =>
                  setExperience(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="e.g. 5"
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>
              Bio &amp; Coaching Philosophy
            </label>

            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your training methodology, achievements, and programs..."
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-4 pt-3 border-t border-border">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImagePlus size={14} />
                Training Center Images
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                Upload up to 5 images of your training center or facilities.
              </p>
            </div>

            <label
              className={`flex flex-col items-center justify-center w-full min-h-32 rounded-2xl border border-dashed border-border bg-background/50 transition ${
                totalImages >= 5
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-muted/50 cursor-pointer"
              }`}
            >
              <ImagePlus size={24} className="text-muted-foreground mb-2" />

              <span className="text-xs font-semibold">
                Click to upload images
              </span>

              <span className="text-[11px] text-muted-foreground mt-1">
                PNG, JPG, WEBP
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleImageChange}
                disabled={totalImages >= 5}
                className="hidden"
              />
            </label>

            {totalImages > 0 && (
              <div className="w-full min-w-0 overflow-x-auto pb-2">
                <div className="flex w-max gap-3">
                  {existingImages.map((image, index) => {
                    const isRemoved =
                      removedExistingImageIndices.includes(index);

                    if (isRemoved) return null;

                    return (
                      <div
                        key={`existing-${index}`}
                        className="relative w-40 h-28 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 group"
                      >
                        <img
                          src={image}
                          alt={`Training center ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}

                  {previewUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative w-40 h-28 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 group"
                    >
                      <img
                        src={url}
                        alt={`Selected image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              {totalImages}/5 images selected
            </p>
          </div>

          <div className="space-y-4 pt-3 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building size={14} />
              Training Center / Facility Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClasses}>Facility Name</label>

                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="Apex Sports Academy"
                  required
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>Street Address</label>

                <input
                  type="text"
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  placeholder="100 Champions Way"
                  required
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>City</label>

                <input
                  type="text"
                  value={centerCity}
                  onChange={(e) => setCenterCity(e.target.value)}
                  placeholder="New York"
                  required
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>State</label>

                <input
                  type="text"
                  value={centerState}
                  onChange={(e) => setCenterState(e.target.value)}
                  placeholder="NY"
                  required
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {savingProfile ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  {profile ? "Save Changes" : "Create Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
