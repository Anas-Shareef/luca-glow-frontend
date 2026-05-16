import { Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Heart, Eye, Star, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";
import { useShop, formatDual } from "@/store/shop";

type Props = {
  product: Product;
  view?: "grid" | "list";
  onQuickView?: (p: Product) => void;
};

export function ProductCard({ product, view = "grid", onQuickView }: Props) {
  const addToCart = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const compare = useShop((s) => s.compare);
  const toggleCompare = useShop((s) => s.toggleCompare);
  const [touched, setTouched] = useState(false);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isWished = wishlist.includes(product.slug);
  const isCompared = compare.includes(product.slug);
  const discount =
    product.compareAtInr && product.compareAtInr > product.priceInr
      ? Math.round(
          ((product.compareAtInr - product.priceInr) / product.compareAtInr) * 100,
        )
      : 0;

  const handleAdd = () => {
    if (!product.inStock) {
      toast.error("Currently out of stock");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to your bag`);
  };

  const handleWish = () => {
    toggleWishlist(product.slug);
    toast(isWished ? "Removed from wishlist" : "Added to wishlist 💕");
  };

  const handleCompare = () => {
    const ok = toggleCompare(product.slug);
    if (!ok) toast.error("You can compare up to 4 products");
  };

  const onTouchStart = () => {
    setTouched(true);
    clearTimeout(touchTimer.current);
  };

  const onTouchEnd = () => {
    touchTimer.current = setTimeout(() => setTouched(false), 3000);
  };

  if (view === "list") {
    return (
      <article className="group flex gap-4 sm:gap-6 border-b pb-6">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="relative shrink-0 w-32 sm:w-48 aspect-[4/5] overflow-hidden bg-muted/40"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
          />
          <img
            src={product.imageHover}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
          <Badges product={product} discount={discount} />
        </Link>
        <div className="flex-1 min-w-0 flex flex-col">
          <Link to="/products/$slug" params={{ slug: product.slug }}>
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wide hover:text-muted-foreground transition-colors">
              {product.name}
            </h3>
          </Link>
          <Stars rating={product.rating} reviews={product.reviews} />
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <Price product={product} />
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="bg-foreground text-background text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-background hover:text-foreground border border-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.inStock ? "Add to Bag" : "Sold Out"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="group relative flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted/40 mb-4">
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          {/* Primary image — fades out on hover/touch */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-105",
              touched && "opacity-0 scale-105",
            )}
          />
          {/* Secondary image — fades in on hover/touch */}
          <img
            src={product.imageHover}
            alt=""
            aria-hidden
            loading="lazy"
            className={cn(
              "absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105",
              touched && "opacity-100 scale-105",
            )}
          />
        </Link>

        <Badges product={product} discount={discount} />

        {/* Wishlist & compare top-right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={handleWish}
            className="size-9 bg-background rounded-full flex items-center justify-center shadow-md hover:bg-foreground hover:text-background transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className={cn("size-4", isWished && "fill-rose text-rose")} />
          </button>
          <button
            onClick={handleCompare}
            className={cn(
              "size-9 bg-background rounded-full flex items-center justify-center shadow-md hover:bg-foreground hover:text-background transition-colors",
              isCompared && "bg-foreground text-background",
            )}
            aria-label="Compare"
          >
            <BarChart2 className="size-4" />
          </button>
        </div>

        {/* Quick actions: visible on hover (desktop) or touch (mobile) */}
        <div
          className={cn(
            "absolute bottom-4 left-0 w-full flex justify-center gap-2 transition-all duration-300 ease-out z-20 px-4",
            "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0",
            touched && "!opacity-100 !translate-y-0",
          )}
        >
          <button
            onClick={() => onQuickView?.(product)}
            className="bg-background p-3 rounded-full shadow-md hover:bg-foreground hover:text-background transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Quick view"
          >
            <Eye className="size-4" />
          </button>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="bg-foreground text-background px-4 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:bg-rose transition-colors disabled:opacity-60 min-h-[44px]"
          >
            {product.inStock ? "+ Quick Add" : "Sold Out"}
          </button>
        </div>
      </div>

      <Stars rating={product.rating} reviews={product.reviews} />
      <Link to="/products/$slug" params={{ slug: product.slug }}>
        <h3 className="text-sm font-semibold uppercase tracking-wide mt-1 text-foreground hover:text-muted-foreground transition-colors line-clamp-2">
          {product.name}
        </h3>
      </Link>
      <p className="text-xs text-muted-foreground mt-0.5">{product.unit}</p>
      <Price product={product} className="mt-2" />
    </article>
  );
}

function Badges({ product, discount }: { product: Product; discount: number }) {
  const tags = product.tags || [];
  
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
      {tags.map((tag) => {
        if (tag === "New Arrival") {
          return (
            <span key={tag} className="bg-background text-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37] text-[#8a6d1c]">
              New Arrival
            </span>
          );
        }
        if (tag === "Best Seller") {
          return (
            <span key={tag} className="bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Best Seller
            </span>
          );
        }
        if (tag === "Low Stock") {
          return (
            <span key={tag} className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200">
              Low Stock
            </span>
          );
        }
        if (tag === "Sale" && discount > 0) {
          return (
            <span key={tag} className="bg-sale text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-full">
              -{discount}%
            </span>
          );
        }
        // Default tag style
        return (
          <span key={tag} className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200">
            {tag}
          </span>
        );
      })}

      {!product.inStock && (
        <span className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          Sold Out
        </span>
      )}
    </div>
  );
}

export function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3",
              i < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
      {reviews > 0 && (
        <span className="text-xs text-muted-foreground">({reviews})</span>
      )}
    </div>
  );
}

function Price({ product, className }: { product: Product; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2 flex-wrap", className)}>
      <span className="font-bold text-foreground text-sm">
        {formatDual(product.priceInr, product.priceAed)}
      </span>
      {product.compareAtInr && (
        <span className="text-xs text-muted-foreground line-through">
          ₹{product.compareAtInr.toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}
