import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Sparkles, Leaf, Heart, Instagram } from "lucide-react";
import { useProducts, useCategories, useSliders } from "@/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luca × Lykha | Feel The Change | Clean Beauty" },
      {
        name: "description",
        content:
          "Discover Luca & Lykha — clean, non-toxic skincare, makeup, fragrance & grooming. Shipping India & UAE.",
      },
      { property: "og:title", content: "Luca × Lykha | Feel The Change" },
      {
        property: "og:description",
        content: "Pure. Cruelty-free. Designed for everyone.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  }),
  component: HomePage,
});


function HomePage() {
  const [quickView, setQuickView] = useState<any>(null);
  const { products, isLoading } = useProducts();
  const { sliders } = useSliders();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Storefront...</div>;

  const trending = products.filter((p) => p.bestSeller || p.newArrival);

  return (
    <>
      <Hero slides={sliders} />
      <CatalogTiles />
      <TrendingCarousel
        title="Trending Right Now"
        subtitle="Loved by our community"
        items={trending}
        onQuickView={setQuickView}
      />
      <BrandValues />
      <ShopByGender />
      <InstagramGrid />
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}

function Hero({ slides }: { slides: any[] }) {
  const [idx, setIdx] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="relative h-[70vh] md:h-[85vh] overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <picture>
            {s.mobile_url && <source media="(max-width: 768px)" srcSet={s.mobile_url} />}
            <img src={s.image_url || undefined} alt={s.title} className="w-full h-full object-cover" />
          </picture>
          <div className="absolute inset-0 bg-foreground/30" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 md:px-10">
              <div className="max-w-xl text-background">
                {s.subtitle && (
                  <p className="text-xs uppercase tracking-[0.4em] mb-3 opacity-90">
                    {s.subtitle}
                  </p>
                )}
                <h1 className="font-display text-5xl md:text-7xl font-bold leading-none mb-4 tracking-[0.05em]">
                  {s.title}
                </h1>
                <p className="text-base md:text-lg opacity-95 mb-8 max-w-md">
                  {s.subtitle}
                </p>
                {s.link_url && (
                  <a
                    href={s.link_url}
                    className="inline-flex items-center justify-center bg-background text-foreground px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-transparent hover:text-background border-2 border-background transition-all"
                  >
                    {s.button_text || 'Shop Now'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-8 bg-background" : "w-4 bg-background/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CatalogTiles() {
  const { categories } = useCategories();
  
  if (!categories.length) return null;

  return (
    <section className="py-16 md:py-24 px-4 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-rose mb-3 font-bold">The Catalog</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-[0.2em] mb-4">
            Shop By Category
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            A curated lookbook of clean, non-toxic beauty essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {categories
            .filter(c => c.slug !== 'men' && c.slug !== 'women')
            .slice(0, 6)
            .map((c, i) => (
            <Link
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className={`group relative overflow-hidden rounded-sm bg-muted/30 ${
                i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div className={`relative ${i === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500" />

                {/* Floating label box */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-8 md:bottom-12 bg-white/95 backdrop-blur-sm px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-center min-w-[220px] md:min-w-[280px] border border-white/20 transition-transform duration-500 group-hover:-translate-y-2">
                  <p className="font-display text-lg md:text-xl font-bold uppercase tracking-[0.25em]">
                    {c.name}
                  </p>
                  {c.description && (
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 normal-case tracking-widest opacity-80 uppercase">
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/catalog" 
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-black border-b-2 border-slate-900 pb-1 hover:text-rose hover:border-rose transition-all"
          >
            Explore Full Catalog <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrendingCarousel({
  title,
  subtitle,
  items,
  onQuickView,
}: {
  title: string;
  subtitle?: string;
  items: Product[];
  onQuickView: (p: Product) => void;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", dragFree: true });

  return (
    <section className="py-12 md:py-20 px-4 bg-cream">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-end justify-between mb-8">
          <SectionHeader eyebrow="Bestsellers" title={title} subtitle={subtitle} align="left" />
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => embla?.scrollPrev()}
              className="size-10 border rounded-full flex items-center justify-center hover:bg-background"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => embla?.scrollNext()}
              className="size-10 border rounded-full flex items-center justify-center hover:bg-background"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {items.map((p) => (
              <div
                key={p.slug}
                className="flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%]"
              >
                <ProductCard product={p} onQuickView={onQuickView} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandValues() {
  const values = [
    {
      icon: Sparkles,
      title: "Guaranteed PURE",
      text: "All formulations adhere to strict purity standards — never harsh or toxic ingredients.",
    },
    {
      icon: Heart,
      title: "Completely Cruelty-Free",
      text: "We take pride in ensuring our products are cruelty-free, never tested on animals.",
    },
    {
      icon: Leaf,
      title: "Ingredient Sourcing",
      text: "Beauty rooted in quality and sustainability with carefully sourced ingredients.",
    },
  ];
  return (
    <section className="py-12 md:py-20 px-4 bg-blush/30">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {values.map((v) => (
            <div key={v.title} className="text-center">
              <div className="size-14 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
                <v.icon className="size-6 text-rose" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 uppercase tracking-widest">
                {v.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopByGender() {
  return (
    <section className="py-12 md:py-24 px-4 bg-white">
      <div className="mx-auto max-w-[1440px] grid md:grid-cols-2 gap-4 md:gap-8">
        {[
          {
            label: "Explore Men",
            tagline: "Refined Grooming for Men",
            slug: "men",
            image: "/images/gender/men.png",
          },
          {
            label: "Explore Women",
            tagline: "Glow Beyond Limits",
            slug: "women",
            image: "/images/gender/women.jpg",
          },
        ].map((g) => (
          <Link
            key={g.label}
            to="/collections/$slug"
            params={{ slug: g.slug }}
            className="group relative overflow-hidden aspect-[16/10] rounded-sm"
          >
            <img
              src={g.image}
              alt={g.label}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
              <h3 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 uppercase tracking-[0.1em] transition-transform duration-700 group-hover:scale-105">
                {g.label.split(' ')[1]}
              </h3>
              <p className="text-sm md:text-base font-medium opacity-90 mb-8 uppercase tracking-widest max-w-xs">
                {g.tagline}
              </p>
              <span className="px-8 py-3 border-2 border-white text-xs font-black uppercase tracking-[0.3em] rounded-full transition-all duration-300 group-hover:bg-white group-hover:text-black">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function InstagramGrid() {
  const imgs = [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1599733589046-8f57e5d3a907?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1631730486572-226d1f595b68?auto=format&fit=crop&w=400&q=80",
  ];
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Follow Us"
          title="On The Gram"
          subtitle="Tag @luca_mixing_official for a chance to be featured."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
          {imgs.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <img
                src={src}
                alt={`Instagram post ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                <Instagram className="size-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-8 ${align === "center" ? "text-center" : "text-left"}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.4em] text-rose mb-2">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-[0.15em]">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-3">{subtitle}</p>}
    </div>
  );
}
