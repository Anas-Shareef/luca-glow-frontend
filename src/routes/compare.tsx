import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useShop, formatDual } from "@/store/shop";
import { useProducts } from "@/hooks/useProducts";
import { Stars } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Products | Luca × Lykha" },
      { name: "description", content: "Compare Luca & Lykha products side-by-side." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const compare = useShop((s) => s.compare);
  const removeCompare = useShop((s) => s.removeCompare);
  const addToCart = useShop((s) => s.addToCart);
  
  const { products, isLoading } = useProducts();
  const items = products.filter((p) => compare.includes(p.slug));

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Compare...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-rose mb-2">Compare</p>
        <h1 className="font-display text-4xl font-bold">Side-by-Side</h1>
        <p className="text-sm text-muted-foreground mt-2">Compare up to 4 products.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No products selected. Click the compare icon on any product card.
          </p>
          <Link
            to="/catalog"
            className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <tbody>
              <tr>
                <td className="w-32" />
                {items.map((p) => (
                  <td key={p.slug} className="p-3 align-top">
                    <div className="relative">
                      <button
                        onClick={() => removeCompare(p.slug)}
                        className="absolute top-1 right-1 size-6 bg-background/90 rounded-full flex items-center justify-center"
                      >
                        <X className="size-3" />
                      </button>
                      <Link to="/products/$slug" params={{ slug: p.slug }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full aspect-square object-cover rounded-md bg-cream"
                        />
                      </Link>
                      <Link
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        className="block mt-2 font-medium text-sm hover:text-rose"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
              <Row label="Price" cells={items.map((p) => formatDual(p.priceInr, p.priceAed))} />
              <Row label="Size" cells={items.map((p) => p.unit)} />
              <Row
                label="Rating"
                cells={items.map((p) => (
                  <Stars key={p.slug} rating={p.rating} reviews={p.reviews} />
                ))}
              />
              <Row label="Key Ingredients" cells={items.map((p) => p.ingredients.join(", "))} />
              <Row label="Benefits" cells={items.map((p) => p.benefits.join(" · "))} />
              <tr>
                <td className="p-3 font-medium text-sm border-t">Action</td>
                {items.map((p) => (
                  <td key={p.slug} className="p-3 border-t">
                    <button
                      onClick={() => {
                        addToCart(p);
                        toast.success(`${p.name} added to bag`);
                      }}
                      className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                      Add to Bag
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr>
      <td className="p-3 font-medium text-sm border-t align-top">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="p-3 text-sm text-muted-foreground border-t align-top">
          {c}
        </td>
      ))}
    </tr>
  );
}
