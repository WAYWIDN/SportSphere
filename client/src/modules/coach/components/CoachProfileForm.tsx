import { Building, Loader2, CheckCircle2, ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CoachProfileData } from "../api/coach.api";

interface CoachProfileFormProps {
  profile: CoachProfileData | null;
  loadingProfile: boolean;
  savingProfile: boolean;

  bio: string;
  experience: number | "";
  sportsInput: string;
  centerName: string;
  centerAddress: string;
  centerCity: string;
  centerState: string;

  profileImages: File[];
  existingImages?: string[];

  onBioChange: (value: string) => void;
  onExperienceChange: (value: number | "") => void;
  onSportsInputChange: (value: string) => void;
  onCenterNameChange: (value: string) => void;
  onCenterAddressChange: (value: string) => void;
  onCenterCityChange: (value: string) => void;
  onCenterStateChange: (value: string) => void;
  onImagesChange: (files: File[]) => void;

  onSubmit: (e: React.FormEvent) => void;
}

export default function CoachProfileForm({
  profile,
  loadingProfile,
  savingProfile,
  bio,
  experience,
  sportsInput,
  centerName,
  centerAddress,
  centerCity,
  centerState,
  profileImages,
  existingImages = [],
  onBioChange,
  onExperienceChange,
  onSportsInputChange,
  onCenterNameChange,
  onCenterAddressChange,
  onCenterCityChange,
  onCenterStateChange,
  onImagesChange,
  onSubmit,
}: CoachProfileFormProps) {
  const inputClasses =
    "w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition";

  const labelClasses =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
    const combinedFiles = [...profileImages, ...imageFiles].slice(
      0,
      Math.max(0, 5 - existingImages.length),
    );
    onImagesChange(combinedFiles);

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const updatedFiles = profileImages.filter((_, i) => i !== index);
    onImagesChange(updatedFiles);
  };

  const totalImages = existingImages.length + profileImages.length;

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
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClasses}>
                Sports Coached (Comma-separated)
              </label>

              <input
                type="text"
                value={sportsInput}
                onChange={(e) => onSportsInputChange(e.target.value)}
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
                  onExperienceChange(
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
              onChange={(e) => onBioChange(e.target.value)}
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
                  {existingImages.map((image, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative w-40 h-28 rounded-2xl overflow-hidden border border-border bg-muted shrink-0"
                    >
                      <img
                        src={image}
                        alt={`Training center ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

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
                  onChange={(e) => onCenterNameChange(e.target.value)}
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
                  onChange={(e) => onCenterAddressChange(e.target.value)}
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
                  onChange={(e) => onCenterCityChange(e.target.value)}
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
                  onChange={(e) => onCenterStateChange(e.target.value)}
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
