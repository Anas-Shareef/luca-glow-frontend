import { useState, useRef } from "react";
import { Star, ThumbsUp, ChevronDown, Camera, User, ShieldCheck, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface ReviewMedia {
  id: number;
  url: string;
}

interface Review {
  id: number;
  user: { name: string };
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  photos: ReviewMedia[];
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              (hover || value) >= s
                ? "fill-[#D4AF37] text-[#D4AF37]"
                : "text-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "size-4",
            rating >= s
              ? "fill-[#D4AF37] text-[#D4AF37]"
              : rating >= s - 0.5
                ? "fill-[#D4AF37]/50 text-[#D4AF37]"
                : "text-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  productSlug,
}: {
  productId: number;
  productSlug: string;
}) {
  const qc = useQueryClient();
  const userJson = localStorage.getItem("luca_user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "highest">("recent");
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['product-reviews', productSlug],
    queryFn: async () => {
      const { data } = await api.get(`/storefront/products/${productSlug}/reviews`);
      return data;
    }
  });

  const submitReview = useMutation({
    mutationFn: (formData: FormData) => api.post('/storefront/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-reviews', productSlug] });
      toast.success("Review submitted! Thank you.");
      setFormOpen(false);
      setRating(0);
      setHeadline("");
      setContent("");
      setSelectedImages([]);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to submit review";
      toast.error(msg);
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((e: any) => toast.error(String(e)));
      }
    }
  });

  const reviews = data?.reviews?.data || [];
  const avgRating = data?.rating || 0;
  const count = data?.count || 0;

  const sortedReviews = [...reviews].sort((a: Review, b: Review) =>
    sortBy === "highest" ? b.rating - a.rating : 0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const formData = new FormData();
    formData.append('product_id', String(productId));
    formData.append('rating', String(rating));
    formData.append('title', headline);
    formData.append('comment', content);
    
    selectedImages.forEach(file => formData.append('images[]', file));

    submitReview.mutate(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold text-[#2E4D31]">
            {Number(avgRating).toFixed(1)}
          </span>
          <div>
            <RatingStars rating={Number(avgRating)} />
            <p className="text-sm text-muted-foreground mt-0.5">
              Based on {count} reviews
            </p>
          </div>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="bg-[#2E4D31] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2E4D31]/90 transition-colors min-h-[44px]"
        >
          {formOpen ? "Close Form" : "Write a Review"}
        </button>
      </div>

      {/* Add Review Form */}
      <Collapsible open={formOpen} onOpenChange={setFormOpen}>
        <CollapsibleContent>
          <form onSubmit={handleSubmit} className="bg-muted/30 rounded-xl p-5 mb-8 border">
            <h3 className="font-semibold text-[#2E4D31] mb-4">
              Your Review
            </h3>
            {!user ? (
               <div className="py-4 text-center">
                 <p className="text-sm text-muted-foreground mb-3">You must be logged in to write a review.</p>
                 <Link to="/auth/login" className="text-[#2E4D31] font-semibold underline">Sign In</Link>
               </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Rating *
                  </label>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Headline (Optional)
                  </label>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background"
                    placeholder="Sum it up in a few words"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Review *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    required
                    className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background resize-none"
                    placeholder="Tell us about your experience…"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Photos (Max 5)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedImages.map((file, i) => (
                      <div key={i} className="relative size-16 rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl-lg">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 border border-dashed rounded-lg px-4 py-2 text-xs text-muted-foreground hover:border-[#2E4D31] hover:text-[#2E4D31] transition-colors"
                  >
                    <Camera className="size-4" />
                    Add Photos
                  </button>
                  <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                </div>

                <button 
                  disabled={submitReview.isPending}
                  className="bg-[#2E4D31] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2E4D31]/90 transition-colors min-h-[44px] flex items-center gap-2"
                >
                  {submitReview.isPending && <Loader2 className="size-4 animate-spin" />}
                  Submit Review
                </button>
              </div>
            )}
          </form>
        </CollapsibleContent>
      </Collapsible>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-5 text-sm">
        <span className="text-muted-foreground">Sort by:</span>
        <button
          onClick={() => setSortBy("recent")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
            sortBy === "recent"
              ? "bg-[#2E4D31] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSortBy("highest")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
            sortBy === "highest"
              ? "bg-[#2E4D31] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Highest Rating
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="py-12 flex justify-center text-muted-foreground italic">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-12 flex justify-center text-muted-foreground italic">No reviews yet. Be the first to share your experience!</div>
        ) : (
          sortedReviews.map((review: Review) => (
            <div
              key={review.id}
              className="border rounded-xl p-5 bg-background"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{review.user.name}</span>
                      <Badge
                        variant={review.is_verified_purchase ? "default" : "secondary"}
                        className="text-[10px] gap-1 py-0"
                      >
                        <ShieldCheck className="size-3" />
                        {review.is_verified_purchase ? "Verified Customer" : "Guest"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <RatingStars rating={review.rating} />
              </div>
              {review.title && <h4 className="font-semibold text-sm mb-1">{review.title}</h4>}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>

              {/* Media Display */}
              {review.photos?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.photos?.map((photo) => (
                    <div key={photo.id} className="relative size-20 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90">
                      <img src={photo.url} className="w-full h-full object-cover" alt="Review photo" />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                  <ThumbsUp className="size-3" />
                  Helpful ({review.helpful_count})
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
