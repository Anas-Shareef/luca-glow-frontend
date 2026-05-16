import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Loader2, ShoppingBag, Sparkles, Droplets, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Product } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { useShop, formatDual } from "@/store/shop";
import { toast } from "sonner";

const POPULAR_TAGS = ["Featured", "Trendy", "Sale", "Best Seller", "New Arrival"] as const;

const CATEGORY_ICONS = [
  { label: "Perfumes", slug: "fragrances", icon: Wind },
  { label: "Creams", slug: "skincare-face", icon: Sparkles },
  { label: "Soaps", slug: "cleansing-soaps", icon: Droplets },
];

const FEATURED_SLUGS = [
  "face-cream",
  "perfume-full",
  "gluta-soap",
  "foundation-rosy-brown",
  "beard-oil",
  "4in1-lipstick",
];

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return true;
  if (q.length < 3) return false;
  let matched = 0;
  let ti = 0;
  for (let qi = 0; qi < q.length && ti < t.length; ti++) {
    if (t[ti] === q[qi]) {
      matched++;
      qi++;
    }
  }
  return matched >= q.length - 1;
}

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addToCart = useShop((s) => s.addToCart);
  const { products } = useProducts();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const featuredProducts = useMemo(
    () => FEATURED_SLUGS.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[],
    [products],
  );

  const searchResults = useMemo(() => {
    if (query.length < 3) return [];
    return products.filter(
      (p) =>
        fuzzyMatch(p.name, query) ||
        fuzzyMatch(p.category, query) ||
        p.tags.some((t) => fuzzyMatch(t, query)),
    );
  }, [query, products]);

  const handleTagClick = useCallback((tag: string) => {
    setQuery(tag);
  }, []);

  const handleQuickAdd = useCallback(
    (p: Product) => {
      if (!p.inStock) {
        toast.error("Out of stock");
        return;
      }
      addToCart(p);
      toast.success(`${p.name} added to bag`);
    },
    [addToCart],
  );

  useEffect(() => {
    if (query.length >= 3) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 150);
      return () => clearTimeout(t);
    }
    setLoading(false);
  }, [query]);

  if (!open) return null;

  const showResults = query.length >= 3 && !loading;
  const noResults = showResults && searchResults.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      {/* Search panel — full screen on mobile, top panel on desktop */}
      <div className="relative bg-background w-full h-full md:h-auto md:max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:right-8 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors z-10"
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>

          {/* Search input */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for perfumes, creams..."
                className="w-full bg-transparent border-b-2 border-foreground/20 focus:border-foreground py-3 pr-12 text-lg font-display tracking-wide placeholder:text-muted-foreground/60 outline-none transition-colors"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            </div>
          </div>

          {/* Popular tags */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Popular:
              </span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-xs uppercase tracking-wider px-3 py-1.5 border rounded-full hover:bg-foreground hover:text-background transition-colors font-medium min-h-[36px]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick category icons — mobile prominent */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-center gap-6">
              {CATEGORY_ICONS.map((cat) => (
                <Link
                  key={cat.slug}
                  to="/collections/$slug"
                  params={{ slug: cat.slug }}
                  onClick={onClose}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="size-14 md:size-16 rounded-full bg-cream flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                    <cat.icon className="size-6" />
                  </div>
                  <span className="text-[10px] md:text-xs uppercase tracking-wider font-medium">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Search results */}
          {showResults && searchResults.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] font-display font-semibold mb-4">
                Results ({searchResults.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.slice(0, 10).map((p) => (
                  <SearchProductCard
                    key={p.slug}
                    product={p}
                    onClose={onClose}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No products found for "{query}"
              </p>
              <h3 className="text-sm uppercase tracking-[0.2em] font-display font-semibold mb-4">
                Trending Products
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {featuredProducts.slice(0, 5).map((p) => (
                  <SearchProductCard
                    key={p.slug}
                    product={p}
                    onClose={onClose}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured products (initial state) */}
          {query.length < 3 && !loading && (
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] font-display font-semibold mb-4">
                Featured Products
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {featuredProducts.map((p) => (
                  <SearchProductCard
                    key={p.slug}
                    product={p}
                    onClose={onClose}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchProductCard({
  product,
  onClose,
  onQuickAdd,
}: {
  product: Product;
  onClose: () => void;
  onQuickAdd: (p: Product) => void;
}) {
  const discount =
    product.compareAtInr && product.compareAtInr > product.priceInr
      ? Math.round(
          ((product.compareAtInr - product.priceInr) / product.compareAtInr) * 100,
        )
      : 0;

  return (
    <div className="group relative">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        onClick={onClose}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/40 rounded-md mb-2">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
          />
          <img
            src={product.imageHover}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.tags?.map((tag) => {
              if (tag === "New Arrival") {
                return (
                  <span key={tag} className="bg-background text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#D4AF37] text-[#8a6d1c]">
                    New Arrival
                  </span>
                );
              }
              if (tag === "Best Seller") {
                return (
                  <span key={tag} className="bg-foreground text-background text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Best Seller
                  </span>
                );
              }
              if (tag === "Low Stock") {
                return (
                  <span key={tag} className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                    Low Stock
                  </span>
                );
              }
              if (tag === "Sale" && discount > 0) {
                return (
                  <span key={tag} className="bg-sale text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                );
              }
              return null;
            })}
            {!product.inStock && (
              <span className="bg-muted text-muted-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            )}
          </div>
        </div>
        <h4 className="text-xs font-semibold uppercase tracking-wide line-clamp-1">
          {product.name}
        </h4>
      </Link>
      <p className="text-xs text-muted-foreground mt-0.5">
        {formatDual(product.priceInr, product.priceAed)}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onQuickAdd(product);
        }}
        disabled={!product.inStock}
        className={cn(
          "mt-1.5 w-full text-[10px] font-bold uppercase tracking-widest py-2 rounded-full transition-colors min-h-[44px]",
          product.inStock
            ? "bg-foreground text-background hover:bg-rose"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {product.inStock ? "Add to Bag" : "Sold Out"}
      </button>
    </div>
  );
}
