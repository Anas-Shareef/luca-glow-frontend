import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  useShop,
  cartSubtotal,
  formatPriceInr,
  formatPriceAed,
  FREE_SHIPPING_THRESHOLD,
} from "@/store/shop";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

const FREE_SHIPPING_AED = 44; // approx 999 INR

export function CartDrawer() {
  const cartOpen = useShop((s) => s.cartOpen);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const cart = useShop((s) => s.cart);
  const removeFromCart = useShop((s) => s.removeFromCart);
  const setQuantity = useShop((s) => s.setQuantity);

  const subtotal = cartSubtotal(cart);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const formattedRemaining = formatPriceInr(remaining);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-display text-lg">Your Bag ({cart.length})</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close" className="min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="size-5" />
          </button>
        </div>

        {/* Free shipping upsell bar */}
        <div className="px-4 py-3 bg-cream">
          {remaining > 0 ? (
            <p className="text-xs text-center mb-2">
              Add <strong>{formattedRemaining}</strong> more for free shipping 🚚
            </p>
          ) : (
            <p className="text-xs text-center mb-2 text-rose font-medium">
              🎉 You've unlocked free shipping!
            </p>
          )}
          <Progress value={progress} className="h-2" />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="size-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Your bag is empty</p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-4 text-sm underline hover:text-rose min-h-[44px]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.product.slug} className="flex gap-3">
                  <Link
                    to="/products/$slug"
                    params={{ slug: item.product.slug }}
                    onClick={() => setCartOpen(false)}
                    className="shrink-0 size-20 bg-cream rounded-md overflow-hidden"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/products/$slug"
                      params={{ slug: item.product.slug }}
                      onClick={() => setCartOpen(false)}
                    >
                      <h3 className="text-sm font-medium line-clamp-1">{item.product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{item.product.unit}</p>
                      {item.product.tags && item.product.tags.length > 0 && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-rose">
                          • {item.product.tags[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            setQuantity(item.product.slug, item.quantity - 1)
                          }
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-muted"
                          aria-label="Decrease"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            setQuantity(item.product.slug, item.quantity + 1)
                          }
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-muted"
                          aria-label="Increase"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPriceInr(item.product.priceInr * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.slug)}
                    className="text-muted-foreground hover:text-destructive min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Remove"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPriceInr(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 text-center uppercase tracking-widest text-sm min-h-[44px] flex items-center justify-center"
            >
              Checkout
            </Link>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full text-sm underline text-muted-foreground hover:text-foreground min-h-[44px]"
            >
              Continue shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
