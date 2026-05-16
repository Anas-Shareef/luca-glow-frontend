import { useRef, useState, useEffect } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function RelatedProducts({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener("scroll", updateScroll, { passive: true });
    return () => el.removeEventListener("scroll", updateScroll);
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 250;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[#2E4D31]">
          You May Also Like
        </h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            className={cn(
              "size-9 rounded-full border flex items-center justify-center transition-colors",
              canLeft
                ? "hover:bg-muted text-foreground"
                : "text-muted-foreground/30 cursor-default",
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canRight}
            className={cn(
              "size-9 rounded-full border flex items-center justify-center transition-colors",
              canRight
                ? "hover:bg-muted text-foreground"
                : "text-muted-foreground/30 cursor-default",
            )}
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {products.map((p) => (
          <div
            key={p.slug}
            className="shrink-0 w-[calc(100%-3rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]"
            style={{ scrollSnapAlign: "start" }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
        <div
          className="h-full bg-[#2E4D31] rounded-full transition-all duration-200"
          style={{ width: `${Math.max(20, progress * 100)}%` }}
        />
      </div>
    </section>
  );
}
