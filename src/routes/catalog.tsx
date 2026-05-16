import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useProducts";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog | Luca × Lykha" },
      {
        name: "description",
        content:
          "Explore the full Luca × Lykha catalog — Skincare, Cleansing Soaps, Lykha Makeup, Fragrances, and Body & Hair Care.",
      },
      { property: "og:title", content: "Catalog | Luca × Lykha" },
      {
        property: "og:description",
        content: "A high-end lookbook of clean, non-toxic beauty essentials.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { categories, isLoading } = useCategories();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Categories...</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12 md:mb-16">
        <p className="text-xs uppercase tracking-[0.4em] text-rose mb-3">The Catalog</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-[0.2em] mb-4">
          Shop By Category
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          A curated lookbook of clean, non-toxic beauty — from skincare to scent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        {categories.map((c, i) => (
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
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 normal-case tracking-widest opacity-80 uppercase">
                  {c.description}
                </p>
              </div>

              {/* Hover Shop Now */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-2 bg-background text-foreground px-4 py-2 text-xs uppercase tracking-widest font-bold rounded-full">
                  Shop Now <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Gender split */}
      <div className="grid md:grid-cols-2 gap-5 md:gap-7 mt-7">
        {[
          {
            label: "Men",
            tagline: "Refined Grooming for Men",
            to: "/collections/$slug" as const,
            slug: "men",
            image: "/images/gender/men.png",
          },
          {
            label: "Women",
            tagline: "Glow Beyond Limits",
            to: "/collections/$slug" as const,
            slug: "women",
            image: "/images/gender/women.jpg",
          },
        ].map((g) => (
          <Link
            key={g.label}
            to={g.to}
            params={{ slug: g.slug }}
            className="group relative overflow-hidden rounded-sm aspect-[16/10]"
          >
            <img
              src={g.image}
              alt={g.label}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
              <p className="text-xs uppercase tracking-[0.4em] mb-4 opacity-90">
                Explore
              </p>
              <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-[0.1em] mb-4 transition-transform duration-700 group-hover:scale-105">
                {g.label}
              </h2>
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
    </div>
  );
}
