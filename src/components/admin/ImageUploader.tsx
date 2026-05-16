import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  /** Current image URLs */
  value: string[];
  /** Called whenever the list of URLs changes */
  onChange: (urls: string[]) => void;
  /** Storage bucket */
  bucket?: string;
  /** Path prefix inside the bucket, e.g. "products" */
  pathPrefix?: string;
  /** Allow multiple images? Defaults true */
  multiple?: boolean;
  /** Max number of images. Defaults 6. */
  max?: number;
  className?: string;
};

/**
 * Admin image uploader. Uploads files to Supabase Storage and returns public
 * URLs to the parent. Drag-to-remove, no reorder yet.
 */
export function ImageUploader({
  value,
  onChange,
  bucket = "product-images",
  pathPrefix = "products",
  multiple = true,
  max = 6,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Max ${max} images allowed`);
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: max 5 MB`);
        continue;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast.error(`${file.name}: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-[#E8E4DF] bg-[#F9F6F1] group"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-[#E8E4DF] hover:border-[#1A2F23] hover:bg-[#F9F6F1] flex flex-col items-center justify-center gap-1.5 text-[#6B6B6B] hover:text-[#1A2F23] transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="size-5" />
                <span className="text-[10px] uppercase tracking-widest">Add</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-[11px] text-[#9E9E9E]">
        Up to {max} images · JPG/PNG/WebP · max 5 MB each.
      </p>
    </div>
  );
}
