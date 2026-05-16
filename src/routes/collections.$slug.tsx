import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { type Product } from "@/data/products";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    // Fallback static info for meta tags
    return { slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Collection | Luca × Lykha` },
      { property: "og:title", content: `Collection | Luca × Lykha` },
    ],
  }),
  component: CollectionPage,
  notFoundComponent: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p>Collection not found.</p>
    </div>
  ),
});

type SortKey = "newest" | "best" | "price-asc" | "price-desc" | "alpha";
type ViewMode = "grid" | "list";

type SizeBucket = "small" | "medium" | "large";

type Filters = {
  inStockOnly: boolean;
  bestOnly: boolean;
  newOnly: boolean;
  sizes: SizeBucket[];
};

const SIZE_BUCKETS: { key: SizeBucket; label: string; test: (p: Product) => boolean }[] = [
  {
    key: "small",
    label: "10g – 50g (Soaps / Lipbalm)",
    test: (p) =>
      (p.unitType === "g" && p.unitValue >= 10 && p.unitValue <= 50) ||
      (p.unitType === "ml" && p.unitValue <= 30),
  },
  {
    key: "medium",
    label: "50ml – 100ml (Creams / Oils)",
    test: (p) =>
      (p.unitType === "ml" && p.unitValue >= 31 && p.unitValue <= 100) ||
      (p.unitType === "g" && p.unitValue >= 51 && p.unitValue <= 100),
  },
  {
    key: "large",
    label: "150ml+ (Face Wash / Hair Oil)",
    test: (p) => p.unitType === "ml" && p.unitValue >= 150,
  },
];

function CollectionPage() {
  const { slug } = Route.useLoaderData();
  const { products, isLoading: loadingProducts } = useProducts();
  const { categories, isLoading: loadingCategories } = useCategories();

  // Combine api categories with static ones (Shop All, Men, Women)
  const allCategories = useMemo(() => {
    return [
      { slug: "all", name: "Shop All", description: "Every Luca & Lykha essential, in one place." },
      ...categories,
      { slug: "men", name: "Men", description: "Refined Grooming for Men." },
      { slug: "women", name: "Women", description: "Glow Beyond Limits." },
    ];
  }, [categories]);

  const category = allCategories.find((c) => c.slug === slug);

  const allProducts = useMemo(() => {
    if (slug === "all") return products;
    if (slug === "men") return products.filter(p => p.gender === "men" || p.gender === "unisex");
    if (slug === "women") return products.filter(p => p.gender === "women" || p.gender === "unisex");
    return products.filter(p => p.category === slug);
  }, [slug, products]);

  const [filters, setFilters] = useState<Filters>({
    inStockOnly: false,
    bestOnly: false,
    newOnly: false,
    sizes: [],
  });
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    setFilters({ inStockOnly: false, bestOnly: false, newOnly: false, sizes: [] });
  }, [slug]);

  const displayed = useMemo(() => {
    let r = allProducts.filter((p) => {
      if (filters.inStockOnly && !p.inStock) return false;
      if (filters.bestOnly && !p.bestSeller) return false;
      if (filters.newOnly && !p.newArrival) return false;
      if (filters.sizes.length > 0) {
        const matches = filters.sizes.some((key) => {
          const b = SIZE_BUCKETS.find((s) => s.key === key);
          return b ? b.test(p) : false;
        });
        if (!matches) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc":
        r = [...r].sort((a, b) => a.priceInr - b.priceInr);
        break;
      case "price-desc":
        r = [...r].sort((a, b) => b.priceInr - a.priceInr);
        break;
      case "alpha":
        r = [...r].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "best":
        r = [...r].sort((a, b) => Number(!!b.bestSeller) - Number(!!a.bestSeller));
        break;
      case "newest":
      default:
        r = [...r].sort((a, b) => Number(!!b.newArrival) - Number(!!a.newArrival));
        break;
    }
    return r;
  }, [allProducts, filters, sort]);

  const toggleSize = (key: SizeBucket) => {
    setFilters((f) => ({
      ...f,
      sizes: f.sizes.includes(key) ? f.sizes.filter((s) => s !== key) : [...f.sizes, key],
    }));
  };

  const activePills: { label: string; remove: () => void }[] = [
    ...(filters.inStockOnly
      ? [{ label: "In Stock", remove: () => setFilters((f) => ({ ...f, inStockOnly: false })) }]
      : []),
    ...(filters.bestOnly
      ? [{ label: "Best Sellers", remove: () => setFilters((f) => ({ ...f, bestOnly: false })) }]
      : []),
    ...(filters.newOnly
      ? [{ label: "New Arrivals", remove: () => setFilters((f) => ({ ...f, newOnly: false })) }]
      : []),
    ...filters.sizes.map((k) => {
      const b = SIZE_BUCKETS.find((s) => s.key === k);
      return { label: b?.label ?? k, remove: () => toggleSize(k) };
    }),
  ];

  const clearAll = () =>
    setFilters({ inStockOnly: false, bestOnly: false, newOnly: false, sizes: [] });

  const Sidebar = (
    <SidebarFilters
      filters={filters}
      setFilters={setFilters}
      toggleSize={toggleSize}
      currentSlug={slug}
      categories={categories}
    />
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full bg-background text-foreground">
      {(loadingProducts || loadingCategories) && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          Loading Collection...
        </div>
      )}
      {/* Header */}
      <div className="pt-10 md:pt-14 pb-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-center space-x-2 text-xs text-muted-foreground uppercase tracking-wider mb-4"
        >
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{category?.name}</span>
        </nav>
        <h1 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-widest text-center mb-3">
          {category?.name}
        </h1>
        {category?.description && (
          <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {/* Main grid */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-x-12 pb-32 lg:pb-24">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          {Sidebar}
        </aside>

        {/* Right column */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{displayed.length}</span>{" "}
              {displayed.length === 1 ? "result" : "results"}
            </p>
            <div className="flex items-center gap-3">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-[180px] border-0 shadow-none bg-transparent text-sm focus:ring-0 px-2 h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">New Arrivals</SelectItem>
                  <SelectItem value="best">Best Sellers</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="alpha">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden sm:flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    view === "grid" ? "bg-foreground text-background" : "hover:bg-muted",
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "p-2 transition-colors",
                    view === "list" ? "bg-foreground text-background" : "hover:bg-muted",
                  )}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {activePills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activePills.map((p) => (
                <button
                  key={p.label}
                  onClick={p.remove}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider border rounded-full px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors"
                >
                  {p.label}
                  <X className="size-3" />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="text-xs uppercase tracking-wider underline hover:no-underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid / List */}
          {displayed.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                No products match these filters.
              </p>
              <button
                onClick={clearAll}
                className="text-sm underline hover:no-underline"
              >
                Clear filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {displayed.map((p) => (
                <ProductCard key={p.slug} product={p} onQuickView={setQuickView} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              {displayed.map((p) => (
                <ProductCard key={p.slug} product={p} view="list" onQuickView={setQuickView} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile sticky filter bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 lg:hidden bg-background border-t p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full bg-foreground text-background font-bold uppercase tracking-widest text-sm py-3 flex items-center justify-center gap-2">
              <SlidersHorizontal className="size-4" /> Filter & Sort
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
            <SheetTitle className="sr-only">Filters</SheetTitle>
            <div className="p-4 border-b">
              <h2 className="font-display text-lg uppercase tracking-widest font-bold">
                Filter & Sort
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold mb-2">Sort</h3>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">New Arrivals</SelectItem>
                    <SelectItem value="best">Best Sellers</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="alpha">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {Sidebar}
            </div>
            <div className="p-4 border-t">
              <SheetTrigger asChild>
                <button className="w-full bg-foreground text-background font-bold uppercase tracking-widest text-sm py-3">
                  View {displayed.length} Products
                </button>
              </SheetTrigger>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function SidebarFilters({
  filters,
  setFilters,
  toggleSize,
  currentSlug,
  categories,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  toggleSize: (k: SizeBucket) => void;
  currentSlug: string;
  categories: any[];
}) {
  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        defaultValue={["category", "availability", "size", "highlights"]}
        className="w-full"
      >
        <AccordionItem value="category" className="border-b">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-bold hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/collections/$slug"
                  params={{ slug: "all" }}
                  className={cn(
                    "block hover:text-foreground transition-colors",
                    currentSlug === "all"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  Shop All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: c.slug }}
                    className={cn(
                      "block hover:text-foreground transition-colors",
                      currentSlug === c.slug
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-b">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-bold hover:no-underline">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.inStockOnly}
                onCheckedChange={(v) =>
                  setFilters((f) => ({ ...f, inStockOnly: !!v }))
                }
              />
              In Stock Only
            </label>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size" className="border-b">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-bold hover:no-underline">
            Unit Count
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {SIZE_BUCKETS.map((b) => (
                <li key={b.key}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={filters.sizes.includes(b.key)}
                      onCheckedChange={() => toggleSize(b.key)}
                    />
                    {b.label}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="highlights" className="border-b">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-bold hover:no-underline">
            Highlights
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={filters.bestOnly}
                  onCheckedChange={(v) =>
                    setFilters((f) => ({ ...f, bestOnly: !!v }))
                  }
                />
                Best Sellers
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={filters.newOnly}
                  onCheckedChange={(v) =>
                    setFilters((f) => ({ ...f, newOnly: !!v }))
                  }
                />
                New Arrivals
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
