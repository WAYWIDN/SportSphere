import {
  Building,
  Loader2,
  CheckCircle2,
  ImagePlus,
  MapPin,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PlaceSelects from "../../../components/ui/PlaceSelects";
import SportChoices from "../../../components/ui/SportChoices";
import { venueOwnerApi, type VenueProfileData } from "../api/venueOwner.api";
import { useAuth } from "../../../context/AuthContext";
import { uploadFile } from "../../../service/cloudinary";

interface VenueProfileFormProps {
  onVenueUpdated?: (venue: VenueProfileData) => void;
}

export default function VenueProfileForm({
  onVenueUpdated,
}: VenueProfileFormProps) {
  const { user } = useAuth();

  const [venue, setVenue] = useState<VenueProfileData | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [savingVenue, setSavingVenue] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [facilitiesInput, setFacilitiesInput] = useState("");

  const [centerAddress, setCenterAddress] = useState("");
  const [centerCity, setCenterCity] = useState("");
  const [centerState, setCenterState] = useState("");
  const [centerCountry, setCenterCountry] = useState("");
  const [centerPincode, setCenterPincode] = useState("");

  // New venue images
  const [venueImages, setVenueImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Existing venue images marked for deletion
  const [removedExistingImageIndices, setRemovedExistingImageIndices] =
    useState<number[]>([]);

  const existingImages = venue?.images || [];

  const inputClasses =
    "w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition";

  const labelClasses =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  const fetchMyVenue = async () => {
    setLoadingVenue(true);

    try {
      const res = await venueOwnerApi.getMyVenues();

      if (res.success && res.data && res.data.length > 0) {
        const v = res.data[0];

        setVenue(v);
        setName(v.name || "");
        setDescription(v.description || "");
        setSelectedSports(v.sports || []);
        setFacilitiesInput(v.facilities ? v.facilities.join(", ") : "");
        setCenterAddress(v.location?.address || "");
        setCenterCity(v.location?.city || "");
        setCenterState(v.location?.state || "");
        setCenterCountry(v.location?.country || "");
        setCenterPincode(v.location?.pincode || "");
      }
    } catch {
      setVenue(null);
    } finally {
      setLoadingVenue(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "venue-owner") {
      fetchMyVenue();
    }
  }, [user]);

  useEffect(() => {
    const urls = venueImages.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [venueImages]);

  const totalImages =
    existingImages.length - removedExistingImageIndices.length +
    venueImages.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    const combinedFiles = [...venueImages, ...imageFiles].slice(0, 5);

    if (venueImages.length + imageFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
    }

    setVenueImages(combinedFiles);

    e.target.value = "";
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setRemovedExistingImageIndices((prev) =>
        prev.includes(index) ? prev : [...prev, index],
      );
    } else {
      setVenueImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSports.length === 0) {
      toast.error("Please choose at least one sport");
      return;
    }

    const facilitiesList = facilitiesInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    if (!centerCountry.trim() || !centerState.trim() || !centerCity.trim()) {
      toast.error("Choose a country, state, and city from the list");
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !centerAddress.trim() ||
      !centerPincode.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSavingVenue(true);

    try {
      // Upload newly selected venue images
      const newImageUrls = await Promise.all(
        venueImages.map(async (file) => {
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

      // Final list of venue images
      const allImages = [...remainingExistingImages, ...validNewImageUrls];

      const payload = {
        name: name.trim(),
        description: description.trim(),
        sports: selectedSports,
        facilities: facilitiesList,
        images: allImages,
        location: {
          address: centerAddress.trim(),
          city: centerCity.trim(),
          state: centerState.trim(),
          country: centerCountry.trim(),
          pincode: centerPincode.trim(),
        },
      };

      if (venue && venue._id) {
        const res = await venueOwnerApi.updateVenue(venue._id, payload);

        if (res.success) {
          toast.success("Venue profile updated successfully!");
          setVenue(res.data);
          setVenueImages([]);
          setRemovedExistingImageIndices([]);

          if (onVenueUpdated) {
            onVenueUpdated(res.data);
          }
        }
      } else {
        const res = await venueOwnerApi.createVenue(payload);

        if (res.success) {
          toast.success("Venue created successfully!");
          setVenue(res.data);
          setVenueImages([]);
          setRemovedExistingImageIndices([]);

          if (onVenueUpdated) {
            onVenueUpdated(res.data);
          }
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save venue profile",
      );
    } finally {
      setSavingVenue(false);
    }
  };

  if (loadingVenue) {
    return (
      <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-xl shadow-black/5">
        <Loader2 className="animate-spin text-primary mx-auto mb-2" size={28} />

        <p className="text-xs text-muted-foreground">
          Loading venue profile...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">
          {venue ? "Edit Venue Profile" : "Create Venue Profile"}
        </h2>

        <p className="text-xs text-muted-foreground">
          {venue
            ? "Update your venue details, facilities, sports, and location"
            : "Set up your venue information so players can discover and book courts"}
        </p>
      </div>

      <form onSubmit={handleSaveVenue} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Building size={14} />
            Venue Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClasses}>Venue Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Sports Arena"
                maxLength={50}
                required
                className={inputClasses}
              />

              <p className="text-[11px] text-muted-foreground text-right">
                {name.length}/50
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClasses}>Description / Bio</label>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your sports complex, court surfaces, opening hours..."
                maxLength={500}
                required
                className={inputClasses}
              />

              <p className="text-[11px] text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClasses}>Sports</label>
              <SportChoices
                selected={selectedSports}
                onChange={setSelectedSports}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>
                Facilities (comma-separated)
              </label>

              <input
                type="text"
                value={facilitiesInput}
                onChange={(e) => setFacilitiesInput(e.target.value)}
                placeholder="Parking, Showers, Locker Rooms, Cafeteria"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-3 border-t border-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImagePlus size={14} />
              Venue Images
            </h3>

            <p className="text-xs text-muted-foreground mt-1">
              Upload up to 5 images of your venue or facilities.
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
                        alt={`Venue ${index + 1}`}
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

        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin size={14} />
            Location Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClasses}>Street Address</label>

              <input
                type="text"
                value={centerAddress}
                onChange={(e) => setCenterAddress(e.target.value)}
                placeholder="123 Stadium Road, Sector 4"
                maxLength={200}
                required
                className={inputClasses}
              />
            </div>

            {!loadingVenue && (
              <PlaceSelects
                country={centerCountry}
                stateName={centerState}
                city={centerCity}
                onCountry={setCenterCountry}
                onState={setCenterState}
                onCity={setCenterCity}
                inputClassName={inputClasses}
                labelClassName={labelClasses}
              />
            )}

            <div className="space-y-1.5">
              <label className={labelClasses}>Pincode / Postal Code</label>

              <input
                type="text"
                value={centerPincode}
                onChange={(e) => setCenterPincode(e.target.value)}
                placeholder="400001"
                maxLength={20}
                required
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            disabled={savingVenue}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {savingVenue ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}

            {venue ? "Save Changes" : "Create Venue Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
