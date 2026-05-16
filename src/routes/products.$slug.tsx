import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, Minus, Plus, Sparkles, Leaf, Truck, Shield, Droplets, BookOpen, Package } from "lucide-react";
import { toast } from "sonner";
import { getCategory } from "@/data/products";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useShop, formatDual } from "@/store/shop";
import { Stars } from "@/components/shop/ProductCard";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    return {
      meta: [
        { title: `Product | Luca × Lykha` },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
      <p>Product not found.</p>
      <Link to="/" className="underline">
        Go home
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  
  const product = products.find(p => p.slug === slug);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(product?.image || "");

  // Update active image when product loads
  useEffect(() => {
    if (product) setActiveImg(product.image);
  }, [product]);

  const addToCart = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const setCartOpen = useShop((s) => s.setCartOpen);

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Product...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found.</div>;

  const isWished = wishlist.includes(product.slug);
  const discount =
    product.compareAtInr && product.compareAtInr > product.priceInr
      ? Math.round(
          ((product.compareAtInr - product.priceInr) / product.compareAtInr) * 100,
        )
      : 0;

  const cat = categories.find((c) => c.slug === product.category);
  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 8);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-rose">Home</Link>
          {" / "}
          <Link
            to="/collections/$slug"
            params={{ slug: product.category }}
            className="hover:text-rose"
          >
            {cat?.name ?? product.category}
          </Link>
          {" / "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-cream rounded-xl overflow-hidden mb-3 relative">
              <img src={activeImg || product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.newArrival && (
                  <span className="bg-background text-[#8a6d1c] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37]">
                    New
                  </span>
                )}
                {product.bestSeller && (
                  <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Best Seller
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-sale text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(product.gallery && product.gallery.length > 0 ? product.gallery : [product.image, product.imageHover]).map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(img)}
                  className={cn(
                    "aspect-square bg-cream rounded-md overflow-hidden border-2",
                    activeImg === img ? "border-rose" : "border-transparent",
                  )}
                >
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose mb-2">
              {cat?.name ?? product.category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{product.name}</h1>
            <Stars rating={product.rating} reviews={product.reviews} />

            <div className="flex items-baseline gap-3 mt-4 flex-wrap">
              <span className="text-2xl md:text-3xl font-semibold">
                {formatDual(product.priceInr, product.priceAed)}
              </span>
              {product.compareAtInr && (
                <span className="text-base text-muted-foreground line-through">
                  ₹{product.compareAtInr.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-4">{product.description}</p>

            <div className="mt-6 space-y-3 text-sm">
              <div>
                <span className="font-medium">Size:</span>{" "}
                <span className="text-muted-foreground">{product.unit}</span>
              </div>
              <div>
                <span className="font-medium">Availability:</span>{" "}
                <span
                  className={cn(
                    "font-medium",
                    product.inStock ? "text-emerald-600" : "text-destructive",
                  )}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Trust mini-icons */}
            <div className="flex flex-wrap gap-3 mt-6 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Sparkles className="size-3.5 text-rose" /> Pure
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="size-3.5 text-rose" /> Cruelty-free
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Leaf className="size-3.5 text-rose" /> Ethically sourced
              </span>
            </div>

            {/* Quantity + CTA */}
            <div className="flex gap-3 mt-8">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Decrease"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="px-4 text-sm w-10 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-3 hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Increase"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                onClick={() => {
                  if (!product.inStock) {
                    toast.error("Currently out of stock");
                    return;
                  }
                  addToCart(product, qty);
                  toast.success(`${product.name} added to your bag`);
                  setCartOpen(true);
                }}
                disabled={!product.inStock}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 min-h-[44px]"
              >
                {product.inStock ? "Add to Bag" : "Sold Out"}
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.slug);
                  toast(isWished ? "Removed from wishlist" : "Added to wishlist 💕");
                }}
                className="border rounded-md px-4 hover:bg-muted min-h-[44px]"
                aria-label="Wishlist"
              >
                <Heart className={cn("size-5", isWished && "fill-rose text-rose")} />
              </button>
            </div>

            {/* Shipping promises */}
            <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 p-3 bg-cream rounded-xl">
                <Truck className="size-4 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Shipping India & UAE</p>
                  <p className="text-muted-foreground">Free over ₹999</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-cream rounded-xl">
                <Shield className="size-4 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Secure checkout</p>
                  <p className="text-muted-foreground">100% safe & protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Accordion */}
        <section className="mt-16 pt-12 border-t">
          <h2 className="font-display text-2xl font-bold text-[#2E4D31] mb-6">
            Product Information
          </h2>
          <Accordion type="multiple" defaultValue={["description"]} className="space-y-3">
            <AccordionItem
              value="description"
              className="border rounded-xl px-5 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="flex items-center gap-2.5 text-sm font-semibold text-[#2E4D31]">
                  <BookOpen className="size-4" />
                  Product Description
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed pb-2">
                  {product.description}
                </p>
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mt-3">
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {product.benefits.map((b: string) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="ingredients"
              className="border rounded-xl px-5 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="flex items-center gap-2.5 text-sm font-semibold text-[#2E4D31]">
                  <Droplets className="size-4" />
                  Ingredients
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Key Ingredients
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    {product.ingredients.map((ing: string) => (
                      <li key={ing}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="usage"
              className="border rounded-xl px-5 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="flex items-center gap-2.5 text-sm font-semibold text-[#2E4D31]">
                  <Leaf className="size-4" />
                  How to Use
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 pb-2">
                  {product.how_to_use && product.how_to_use.length > 0 ? (
                    product.how_to_use.map((step: string, i: number) => (
                      <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
                    ))
                  ) : (
                    <li>No instructions provided.</li>
                  )}
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="shipping"
              className="border rounded-xl px-5 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="flex items-center gap-2.5 text-sm font-semibold text-[#2E4D31]">
                  <Package className="size-4" />
                  Shipping & Returns
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-muted-foreground pb-2">
                  {product.shipping_returns && product.shipping_returns.length > 0 ? (
                    product.shipping_returns.map((line: string, i: number) => {
                      // Simple logic: if line contains a colon or is a known title, bold the first part
                      const parts = line.split(/[:：]/);
                      if (parts.length > 1 && parts[0].length < 30) {
                        return (
                          <div key={i}>
                            <p className="font-bold text-foreground mb-0.5">{parts[0].trim()}</p>
                            <p>{parts.slice(1).join(":").trim()}</p>
                          </div>
                        );
                      }
                      // If it's a very short line, treat as title
                      if (line.length < 20 && !line.includes(" ")) {
                         return <p key={i} className="font-bold text-foreground mt-2 first:mt-0">{line}</p>;
                      }
                      return <p key={i}>{line}</p>;
                    })
                  ) : (
                    <p>Free shipping on orders over ₹999. Standard delivery: 3–5 business days.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Reviews */}
        <section className="mt-16 pt-12 border-t">
          <h2 className="font-display text-2xl font-bold text-[#2E4D31] mb-6">
            Customer Reviews
          </h2>
          <ProductReviews
            productId={product.id}
            productSlug={product.slug}
          />
        </section>

        {/* Related Products */}
        <RelatedProducts products={related} />
      </div>

      {/* Sticky mobile Add to Cart bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-background border-t p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md shrink-0">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="min-w-[40px] min-h-[44px] flex items-center justify-center hover:bg-muted"
              aria-label="Decrease"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="px-3 text-sm w-8 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="min-w-[40px] min-h-[44px] flex items-center justify-center hover:bg-muted"
              aria-label="Increase"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              if (!product.inStock) {
                toast.error("Currently out of stock");
                return;
              }
              addToCart(product, qty);
              toast.success(`${product.name} added to your bag`);
              setCartOpen(true);
            }}
            disabled={!product.inStock}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 min-h-[44px] uppercase tracking-widest text-sm"
          >
            {product.inStock ? "Add to Bag" : "Sold Out"}
          </button>
        </div>
      </div>
    </>
  );
}
