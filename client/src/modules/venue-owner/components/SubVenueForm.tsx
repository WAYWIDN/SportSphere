import { useEffect, useState } from "react";
import { ImagePlus, Loader2, CheckCircle2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  venueOwnerApi,
  type SubvenueData,
  type CreateSubvenueInput,
  type UpdateSubvenueInput,
} from "../api/venueOwner.api";
import { uploadFile } from "../../../service/cloudinary";
import { SPORTS } from "../../../constants/sportOptions";

interface SubVenueFormProps {
  venueId: string;
  initialData?: SubvenueData | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function SubVenueForm({
  venueId,
  initialData,
  onSaved,
  onCancel,
}: SubVenueFormProps) {
  const isEdit = Boolean(initialData && initialData._id);

  const [name, setName] = useState(initialData?.name || "");
  const [sport, setSport] = useState(initialData?.sport || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const [subvenueImages, setSubvenueImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [removedExistingImageIndices, setRemovedExistingImageIndices] =
    useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const inputClasses =
    "w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition";

  const labelClasses =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  // Sync state when initialData changes
  useEffect(() => {
    setName(initialData?.name || "");
    setSport(initialData?.sport || "");
    setDescription(initialData?.description || "");
    setSubvenueImages([]);
    setRemovedExistingImageIndices([]);
  }, [initialData]);

  // Generate object URLs for newly picked files
  useEffect(() => {
    const urls = subvenueImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [subvenueImages]);

  const existingImages = initialData?.images || [];
  const currentExistingCount =
    existingImages.length - removedExistingImageIndices.length;
  const totalImages = currentExistingCount + subvenueImages.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    const availableSlots = 5 - currentExistingCount - subvenueImages.length;
    const newFiles = imageFiles.slice(0, Math.max(0, availableSlots));

    if (newFiles.length < imageFiles.length) {
      toast.error("You can upload a maximum of 5 images");
    }

    setSubvenueImages((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setRemovedExistingImageIndices((prev) =>
        prev.includes(index) ? prev : [...prev, index]
      );
    } else {
      setSubvenueImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sport.trim() || !description.trim()) {
      toast.error("Please fill in subvenue name, sport, and description");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload newly added image files
      const newImageUrls = await Promise.all(
        subvenueImages.map(async (file) => {
          try {
            return await uploadFile(file);
          } catch (err: any) {
            toast.error(
              err.response?.data?.message ||
                err.message ||
                "Failed to upload image"
            );
            return "";
          }
        })
      );

      const validNewImageUrls = newImageUrls.filter(Boolean);

      // 2. Filter out deleted existing images
      const remainingExistingImages = existingImages.filter(
        (_, index) => !removedExistingImageIndices.includes(index)
      );

      const allImages = [...remainingExistingImages, ...validNewImageUrls];

      if (isEdit && initialData) {
        // Edit mode
        const payload: UpdateSubvenueInput = {
          name: name.trim(),
          sport: sport.trim(),
          description: description.trim(),
          images: allImages,
        };

        const res = await venueOwnerApi.updateSubvenue(
          initialData._id,
          payload
        );

        if (res.success) {
          toast.success("Subvenue updated successfully!");
          setSubvenueImages([]);
          setRemovedExistingImageIndices([]);
          if (onSaved) onSaved();
        }
      } else {
        // Create mode
        const payload: CreateSubvenueInput = {
          name: name.trim(),
          sport: sport.trim(),
          description: description.trim(),
          images: allImages,
        };

        const res = await venueOwnerApi.createSubvenue(venueId, payload);

        if (res.success) {
          toast.success("Subvenue created successfully!");
          setName("");
          setSport("");
          setDescription("");
          setSubvenueImages([]);
          setRemovedExistingImageIndices([]);
          if (onSaved) onSaved();
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} subvenue`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {isEdit ? "Edit Subvenue" : "Add New Subvenue"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEdit
              ? "Update this court or playing area details and images"
              : "Create a specific court, pitch, turf, or hall under your venue"}
          </p>
        </div>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            title="Close Form"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClasses}>Subvenue Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Court A (Indoor Hardwood)"
              maxLength={50}
              required
              className={inputClasses}
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {name.length}/50
            </p>
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>Sport</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              required
              className={inputClasses}
            >
              <option value="">Select sport</option>
              {SPORTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClasses}>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe surface type, equipment provided, lighting conditions..."
            maxLength={500}
            required
            className={inputClasses}
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {description.length}/500
          </p>
        </div>

        {/* Subvenue Images */}
        <div className="space-y-4 pt-3 border-t border-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImagePlus size={14} />
              Subvenue Images
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Upload up to 5 images of this court, pitch, turf, or hall.
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
            <span className="text-xs font-semibold">Click to upload images</span>
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
                {/* Existing Images */}
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
                        alt={`Subvenue ${index + 1}`}
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

                {/* New Preview Images */}
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
                      onClick={() => removeImage(index, false)}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              Cancel
            </button>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : isEdit ? (
              <>
                <CheckCircle2 size={14} />
                Save Changes
              </>
            ) : (
              <>
                <Plus size={14} />
                Add Subvenue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
