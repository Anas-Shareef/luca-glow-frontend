import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useShop } from "@/store/shop";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist | Luca Cosmetics" },
      { name: "description", content: "Your saved Luca favourites." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlist = useShop((s) => s.wishlist);
  const { products, isLoading } = useProducts();
  const items = products.filter((p) => wishlist.includes(p.slug));

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Wishlist...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-rose mb-2">Saved For Later</p>
        <h1 className="font-display text-4xl font-bold">My Wishlist</h1>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="size-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Link
            to="/catalog"
            className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
