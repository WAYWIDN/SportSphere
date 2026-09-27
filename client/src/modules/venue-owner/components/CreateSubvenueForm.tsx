import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { venueOwnerApi, type CreateSubvenueInput } from "../api/venueOwner.api";

interface CreateSubvenueFormProps {
  venueId: string;
  onCreated?: () => void;
}

export default function CreateSubvenueForm({
  venueId,
  onCreated,
}: CreateSubvenueFormProps) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [description, setDescription] = useState("");
  const [subvenueImages, setSubvenueImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [creatingSubvenue, setCreatingSubvenue] = useState(false);

  const inputClasses =
    "w-full px-4 py-2.5 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-xs transition";

  const labelClasses =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  useEffect(() => {
    const urls = subvenueImages.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [subvenueImages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    const combinedFiles = [...subvenueImages, ...imageFiles].slice(0, 5);

    if (subvenueImages.length + imageFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
    }

    setSubvenueImages(combinedFiles);

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSubvenueImages((currentImages) =>
      currentImages.filter((_, i) => i !== index),
    );
  };

  const handleCreateSubvenue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sport.trim() || !description.trim()) {
      toast.error("Please fill in subvenue name, sport, and description");
      return;
    }

    setCreatingSubvenue(true);

    try {
      const payload: CreateSubvenueInput = {
        name: name.trim(),
        sport: sport.trim(),
        description: description.trim(),
        images: [],
      };

      const res = await venueOwnerApi.createSubvenue(venueId, payload);

      if (res.success) {
        toast.success("Subvenue created successfully!");

        setName("");
        setSport("");
        setDescription("");
        setSubvenueImages([]);

        if (onCreated) {
          onCreated();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create subvenue");
    } finally {
      setCreatingSubvenue(false);
    }
  };

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border space-y-5">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold tracking-tight">Add New Subvenue</h2>

        <p className="text-xs text-muted-foreground">
          Create a specific court, pitch, turf, or hall under your venue
        </p>
      </div>

      <form onSubmit={handleCreateSubvenue} className="space-y-4">
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

            <input
              type="text"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="e.g. Badminton, Football, Basketball"
              required
              className={inputClasses}
            />
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
              subvenueImages.length >= 5
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
              disabled={subvenueImages.length >= 5}
              className="hidden"
            />
          </label>

          {subvenueImages.length > 0 && (
            <div className="w-full min-w-0 overflow-x-auto pb-2">
              <div className="flex w-max gap-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative w-40 h-28 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 group"
                  >
                    <img
                      src={url}
                      alt={`Subvenue image ${index + 1}`}
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
            {subvenueImages.length}/5 images selected
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={creatingSubvenue}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {creatingSubvenue ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}

            {creatingSubvenue ? "Creating..." : "Add Subvenue"}
          </button>
        </div>
      </form>
    </div>
  );
}
