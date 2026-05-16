import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/data/products";
import { useShop, formatDual } from "@/store/shop";
import { Stars } from "./ProductCard";

type Props = {
  product: Product | null;
  onClose: () => void;
};

export function QuickViewModal({ product, onClose }: Props) {
  const addToCart = useShop((s) => s.addToCart);

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl w-[90vw] md:w-full p-0 overflow-hidden">
        {product && (
          <div className="grid md:grid-cols-2">
            <div className="aspect-square bg-cream">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 md:p-6 flex flex-col">
              <DialogTitle className="font-display text-xl md:text-2xl pr-8">{product.name}</DialogTitle>
              <Stars rating={product.rating} reviews={product.reviews} />
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-xl md:text-2xl font-semibold">
                  {formatDual(product.priceInr, product.priceAed)}
                </span>
                {product.compareAtInr && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.compareAtInr.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <DialogDescription className="mt-3 text-sm">
                {product.description}
              </DialogDescription>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p>
                  <strong className="text-foreground">Size:</strong> {product.unit}
                </p>
                <p>
                  <strong className="text-foreground">Key Ingredients:</strong>{" "}
                  {product.ingredients.join(", ")}
                </p>
              </div>
              <div className="mt-auto pt-6 space-y-2">
                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success(`${product.name} added to your bag`);
                    onClose();
                  }}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90"
                >
                  Add to Bag
                </button>
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  onClick={onClose}
                  className="block text-center text-sm underline hover:text-rose"
                >
                  View full details
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
