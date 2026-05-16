import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = { product: Product; quantity: number };
export type Currency = "INR";

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  cartOpen: boolean;
  currency: Currency;
  addToCart: (p: Product, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  setQuantity: (slug: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  toggleCompare: (slug: string) => boolean;
  removeCompare: (slug: string) => void;
  setCartOpen: (open: boolean) => void;
  setCurrency: (c: Currency) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      compare: [],
      cartOpen: false,
      currency: "INR",
      addToCart: (product, qty = 1) => {
        const existing = get().cart.find((i) => i.product.slug === product.slug);
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.product.slug === product.slug ? { ...i, quantity: i.quantity + qty } : i,
            ),
          });
        } else {
          set({ cart: [...get().cart, { product, quantity: qty }] });
        }
      },
      removeFromCart: (slug) =>
        set({ cart: get().cart.filter((i) => i.product.slug !== slug) }),
      setQuantity: (slug, qty) => {
        if (qty <= 0) {
          set({ cart: get().cart.filter((i) => i.product.slug !== slug) });
        } else {
          set({
            cart: get().cart.map((i) =>
              i.product.slug === slug ? { ...i, quantity: qty } : i,
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (slug) => {
        const w = get().wishlist;
        set({ wishlist: w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug] });
      },
      toggleCompare: (slug) => {
        const c = get().compare;
        if (c.includes(slug)) {
          set({ compare: c.filter((s) => s !== slug) });
          return true;
        }
        if (c.length >= 4) return false;
        set({ compare: [...c, slug] });
        return true;
      },
      removeCompare: (slug) =>
        set({ compare: get().compare.filter((s) => s !== slug) }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "luca-shop" },
  ),
);

// Cart helpers
export const cartCount = (cart: CartItem[]) =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

export const cartSubtotal = (cart: CartItem[]) =>
  cart.reduce((sum, item) => sum + item.product.priceInr * item.quantity, 0);

export const FREE_SHIPPING_THRESHOLD = 999; // INR

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format INR rupees. */
export const formatINR = (rupees: number) => inrFormatter.format(rupees);
export const formatPriceInr = formatINR;

/** Convert paise (×100 storage) to formatted INR string. */
export const formatPaise = (paise: number) => formatINR(Math.round(paise) / 100);

/**
 * Legacy helpers retained as INR-only shims after dropping AED.
 * `currency` and AED amounts are ignored.
 */
export const formatPrice = (rupees: number, _currency?: Currency) => formatINR(rupees);
export const formatPriceAed = (_aed: number | null) => "";
export const formatDual = (inr: number, _aed?: number | null) => formatINR(inr);
