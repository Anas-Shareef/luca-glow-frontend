import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Lock, ShoppingBag, ChevronRight, Check } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import {
  useShop,
  cartSubtotal,
  formatPrice,
  type Currency,
} from "@/store/shop";
import lucaLogo from "@/assets/luca-logo.png";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · LUCA" },
      { name: "description", content: "Secure checkout for LUCA Cosmetics — India & UAE." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const indiaSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().regex(/^[+\d\s-]{8,15}$/, "Valid phone required"),
  address: z.string().min(4, "Address required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "India pincode must be 6 digits")
    .or(z.string().regex(/^\d{4,6}$/, "UAE area code 4–6 digits")),
  country: z.enum(["India", "UAE"]),
});

type Step = "identity" | "shipping" | "method" | "payment";
const STEPS: { id: Step; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "shipping", label: "Shipping" },
  { id: "method", label: "Method" },
  { id: "payment", label: "Payment" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useShop((s) => s.cart);
  const currency = useShop((s) => s.currency);
  const clearCart = useShop((s) => s.clearCart);

  const [step, setStep] = useState<Step>("identity");
  const [shipMethod, setShipMethod] = useState<"standard" | "express">("standard");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India" as "India" | "UAE",
  });

  // Auto-fill from saved default address
  useEffect(() => {
    const token = localStorage.getItem('luca_token');
    const userRaw = localStorage.getItem('luca_user');
    if (!token) return;
    api.get('/storefront/addresses', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      const def = data.find((a: any) => a.isDefault) ?? data[0];
      if (!def) return;
      const nameParts = (def.fullName || '').split(' ');
      const userEmail = userRaw ? JSON.parse(userRaw)?.email ?? '' : '';
      setForm(prev => ({
        ...prev,
        email: prev.email || userEmail,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        phone: prev.phone || def.phone || '',
        address: prev.address || [def.street, def.apt].filter(Boolean).join(', '),
        city: prev.city || def.city || '',
        state: prev.state || def.state || '',
        pincode: prev.pincode || def.zip || '',
        country: prev.country || def.country || 'India',
      }));
    }).catch(() => {
      // Not logged in or no addresses — form stays empty
    });
  }, []);

  const [couponData, setCouponData] = useState<{ type: string, value: number } | null>(null);
  const subtotal = cartSubtotal(cart);
  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    if (shipMethod === "express") return form.country === "UAE" ? 800 : 199;
    if (subtotal >= 999) return 0;
    return form.country === "UAE" ? 400 : 79;
  }, [shipMethod, subtotal, form.country]);
  const taxRate = form.country === "UAE" ? 0.05 : 0.18;
  
  const discount = useMemo(() => {
    if (!promoApplied || !couponData) return 0;
    if (couponData.type === 'percentage') {
      return Math.round(subtotal * (couponData.value / 100));
    }
    return couponData.value;
  }, [promoApplied, couponData, subtotal]);

  const taxableBase = Math.max(0, subtotal - discount);
  const tax = 0;
  const total = taxableBase + shipping;

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const goNext = () => {
    if (step === "identity") {
      if (!z.string().email().safeParse(form.email).success) {
        toast.error("Enter a valid email");
        return;
      }
      setStep("shipping");
    } else if (step === "shipping") {
      const result = indiaSchema.safeParse(form);
      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }
      setStep("method");
    } else if (step === "method") {
      setStep("payment");
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const token = localStorage.getItem('luca_token');

    // Build payload
    const payload = {
      items: cart.map((i) => ({
        product_slug: i.product.slug,
        quantity: i.quantity,
      })),
      shipping: {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        address_line_1: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
      },
      shipping_method: shipMethod,
      payment_method: paymentMethod,
      coupon_code: promoApplied ? promo : null,
      subtotal,
      shipping_cost: shipping,
      tax: 0,
      discount,
      total,
    };

    setPlacing(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await api.post('/storefront/checkout', payload, { headers });
      toast.success(`Order ${res.data.order_number} placed! 🎉`);
      clearCart();
      setTimeout(() => navigate({ to: '/account' }), 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not place order. Please try again.';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const applyPromo = async () => {
    if (!promo.trim()) return;
    try {
      const { data } = await api.post('/coupons/validate', {
        code: promo,
        cart_total: subtotal
      });
      setCouponData({ type: data.type, value: data.value });
      setPromoApplied(true);
      toast.success(data.message);
    } catch (err: any) {
      setPromoApplied(false);
      setCouponData(null);
      toast.error(err.response?.data?.message || 'Invalid promo code');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="size-12 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl mb-2">Your bag is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Add products before heading to checkout.
        </p>
        <Link
          to="/catalog"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      {/* Minimal secure header */}
      <header className="border-b">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" aria-label="LUCA Home">
            <img src={lucaLogo} alt="LUCA" className="h-8 sm:h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            <Lock className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Secure Connection</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile: Order summary collapsible at top */}
        <details className="lg:hidden border rounded-lg mb-6 bg-cream">
          <summary className="flex items-center justify-between p-4 cursor-pointer">
            <span className="font-display text-sm uppercase tracking-widest">Order Summary ({cart.length})</span>
            <span className="font-bold">{formatPrice(total, currency)}</span>
          </summary>
          <div className="px-4 pb-4">
            <OrderSummaryContent
              cart={cart}
              currency={currency}
              promo={promo}
              setPromo={setPromo}
              promoApplied={promoApplied}
              applyPromo={applyPromo}
              subtotal={subtotal}
              discount={discount}
              shipping={shipping}
              tax={tax}
              taxRate={taxRate}
              total={total}
              country={form.country}
            />
          </div>
        </details>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-10">
          {/* Column A: steps */}
          <div className="min-w-0">
            {/* Stepper — horizontal scroll on small screens */}
            <ol className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 text-[10px] sm:text-xs uppercase tracking-widest overflow-x-auto">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span
                    className={cn(
                      "size-5 sm:size-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0",
                      i < stepIndex
                        ? "bg-primary text-primary-foreground"
                        : i === stepIndex
                          ? "bg-rose text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i < stepIndex ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span className={cn(i === stepIndex ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="size-3 text-muted-foreground shrink-0" />}
                </li>
              ))}
            </ol>

            {/* Identity */}
            <Section title="1. Identity" open={step === "identity"} done={stepIndex > 0}>
              <label className="block text-xs uppercase tracking-widest mb-2">
                Email or phone (for OTP)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                className="w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={goNext}
                className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest"
              >
                Continue to shipping
              </button>
            </Section>

            {/* Shipping */}
            <Section title="2. Shipping address" open={step === "shipping"} done={stepIndex > 1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} />
                <FormInput label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} />
                <FormInput label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+91 / +971" />
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-2">Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className="w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="India">India</option>
                    <option value="UAE">United Arab Emirates</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <FormInput label="Address" value={form.address} onChange={(v) => update("address", v)} />
                </div>
                <FormInput label="City" value={form.city} onChange={(v) => update("city", v)} />
                <FormInput label="State / Emirate" value={form.state} onChange={(v) => update("state", v)} />
                <FormInput
                  label={form.country === "UAE" ? "Area code" : "Pincode"}
                  value={form.pincode}
                  onChange={(v) => update("pincode", v)}
                />
              </div>
              <button
                onClick={goNext}
                className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest"
              >
                Continue to method
              </button>
            </Section>

            {/* Shipping method */}
            <Section title="3. Shipping method" open={step === "method"} done={stepIndex > 2}>
              <RadioRow
                label="Standard (3–5 days)"
                price={
                  subtotal >= 999
                    ? "FREE"
                    : formatPrice(form.country === "UAE" ? 400 : 79, currency)
                }
                checked={shipMethod === "standard"}
                onSelect={() => setShipMethod("standard")}
              />
              <RadioRow
                label="Express (1–2 days)"
                price={formatPrice(form.country === "UAE" ? 800 : 199, currency)}
                checked={shipMethod === "express"}
                onSelect={() => setShipMethod("express")}
              />
              <button
                onClick={goNext}
                className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest"
              >
                Continue to payment
              </button>
            </Section>

            {/* Payment */}
            <Section title="4. Payment" open={step === "payment"} done={false}>
              <div className="space-y-3">
                {/* Razorpay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={cn(
                    "w-full border-2 rounded-lg p-4 text-left transition-all",
                    paymentMethod === 'razorpay'
                      ? "border-rose bg-rose/5"
                      : "border-border hover:border-rose/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "size-4 rounded-full border-2 flex items-center justify-center shrink-0",
                        paymentMethod === 'razorpay' ? "border-rose" : "border-muted-foreground"
                      )}>
                        {paymentMethod === 'razorpay' && <span className="size-2 rounded-full bg-rose block" />}
                      </span>
                      <span className="font-semibold text-sm">Razorpay</span>
                    </div>
                    {/* Razorpay badge */}
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-600 text-white rounded">
                      Razorpay
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    UPI · Debit / Credit Cards · Net Banking · Wallets · EMI
                  </p>
                  {paymentMethod === 'razorpay' && (
                    <div className="mt-3 ml-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-xs text-amber-700 font-medium">
                        ⚡ Razorpay integration ready — keys will be configured shortly.
                        Clicking Pay will record your order and process payment once live.
                      </p>
                    </div>
                  )}
                </button>

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "w-full border-2 rounded-lg p-4 text-left transition-all",
                    paymentMethod === 'cod'
                      ? "border-rose bg-rose/5"
                      : "border-border hover:border-rose/40"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "size-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      paymentMethod === 'cod' ? "border-rose" : "border-muted-foreground"
                    )}>
                      {paymentMethod === 'cod' && <span className="size-2 rounded-full bg-rose block" />}
                    </span>
                    <span className="font-semibold text-sm">Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Pay in cash when your order arrives. Available across India.
                  </p>
                </button>

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="w-full bg-rose text-primary-foreground px-6 py-3.5 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-rose/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      {paymentMethod === 'cod' ? 'Confirm Order' : `Pay ${formatPrice(total, currency)}`}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <Lock className="size-3" /> 256-bit SSL · PCI DSS compliant
                </p>
              </div>
            </Section>
          </div>

          {/* Column B: order summary (desktop only — sticky sidebar) */}
          <aside className="hidden lg:block lg:sticky lg:top-6 self-start border rounded-lg p-5 bg-cream">
            <h2 className="font-display text-base uppercase tracking-widest mb-4">Order Summary</h2>
            <OrderSummaryContent
              cart={cart}
              currency={currency}
              promo={promo}
              setPromo={setPromo}
              promoApplied={promoApplied}
              applyPromo={applyPromo}
              subtotal={subtotal}
              discount={discount}
              shipping={shipping}
              tax={tax}
              taxRate={taxRate}
              total={total}
              country={form.country}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

/* Shared order summary content */
function OrderSummaryContent({
  cart,
  currency,
  promo,
  setPromo,
  promoApplied,
  applyPromo,
  subtotal,
  discount,
  shipping,
  tax,
  taxRate,
  total,
  country,
}: {
  cart: { product: { slug: string; image: string; name: string; unit: string; priceInr: number }; quantity: number }[];
  currency: Currency;
  promo: string;
  setPromo: (v: string) => void;
  promoApplied: boolean;
  applyPromo: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  taxRate: number;
  total: number;
  country: string;
}) {
  return (
    <>
      <ul className="space-y-3 mb-4 max-h-72 overflow-y-auto">
        {cart.map((i) => (
          <li key={i.product.slug} className="flex gap-3">
            <div className="relative shrink-0 size-14 sm:size-16 bg-background rounded-md overflow-hidden">
              <img src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
              <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] size-5 rounded-full flex items-center justify-center">
                {i.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-2">{i.product.name}</p>
              <p className="text-[11px] text-muted-foreground">{i.product.unit}</p>
            </div>
            <span className="text-xs font-semibold shrink-0">
              {formatPrice(i.product.priceInr * i.quantity, currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mb-4">
        <input
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="Promo code (try LUCA10)"
          className="flex-1 min-w-0 bg-background border rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={applyPromo}
          className="bg-foreground text-background px-3 py-2 rounded-md text-xs uppercase tracking-widest shrink-0"
        >
          Apply
        </button>
      </div>

      <dl className="space-y-2 text-sm border-t pt-4">
        <SummaryRow label="Subtotal" value={formatPrice(subtotal, currency)} />
        {discount > 0 && <SummaryRow label="Discount" value={`− ${formatPrice(discount, currency)}`} />}
        <SummaryRow
          label="Shipping"
          value={shipping === 0 ? "FREE" : formatPrice(shipping, currency)}
        />
        <div className="flex justify-between pt-3 border-t font-bold text-base">
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </dl>
      <p className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1">
        <Lock className="size-3" /> 256-bit SSL · PCI DSS compliant gateways
      </p>
    </>
  );
}

function Section({
  title,
  open,
  done,
  children,
}: {
  title: string;
  open: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "border rounded-lg p-4 sm:p-5 mb-4 transition-opacity",
        !open && !done && "opacity-50",
      )}
    >
      <h3 className="font-display text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
        {done && <Check className="size-4 text-rose" />}
        {title}
      </h3>
      {open && children}
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function RadioRow({
  label,
  price,
  checked,
  onSelect,
}: {
  label: string;
  price: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center justify-between border rounded-md px-4 py-3 mb-2 text-left transition-all",
        checked ? "border-rose ring-1 ring-rose bg-cream" : "hover:border-foreground/40",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "size-4 rounded-full border-2 shrink-0",
            checked ? "border-rose bg-rose" : "border-muted-foreground",
          )}
        />
        <span className="text-sm">{label}</span>
      </span>
      <span className="text-sm font-semibold shrink-0">{price}</span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
