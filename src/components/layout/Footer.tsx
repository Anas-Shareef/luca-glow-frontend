import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, Truck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSettings } from "@/store/settings";
import lucaLogoFallback from "@/assets/luca-logo.png";

const emailSchema = z.string().email("Please enter a valid email");

const linkCols = [
  {
    title: "Catalog",
    links: [
      { label: "Skincare & Face", slug: "skincare-face" },
      { label: "Cleansing Soaps", slug: "cleansing-soaps" },
      { label: "Lykha Makeup", slug: "lykha-makeup" },
      { label: "Fragrances", slug: "fragrances" },
      { label: "Body & Hair Care", slug: "body-hair-care" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", slug: "_contact" },
      { label: "Track Order", slug: "_account" },
      { label: "FAQ", slug: "_contact" },
      { label: "Shipping (India)", slug: "_contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", slug: "_about" },
      { label: "Terms & Conditions", slug: "_about" },
      { label: "Return Policy", slug: "_about" },
    ],
  },
];

function FooterLink({ label, slug }: { label: string; slug: string }) {
  if (slug === "_contact") return <Link to="/contact" className="text-sm text-muted-foreground hover:text-rose">{label}</Link>;
  if (slug === "_account") return <Link to="/account" className="text-sm text-muted-foreground hover:text-rose">{label}</Link>;
  if (slug === "_about") return <Link to="/about" className="text-sm text-muted-foreground hover:text-rose">{label}</Link>;
  return <Link to="/collections/$slug" params={{ slug }} className="text-sm text-muted-foreground hover:text-rose">{label}</Link>;
}

export function Footer() {
  const settings = useSettings((s) => s.settings);
  const [email, setEmail] = useState("");

  const logoUrl = settings?.logo_url || lucaLogoFallback;
  const storeName = settings?.store_name || "LUCA × LYKHA";
  const tagline = settings?.tagline || "Feel The Change · Since 2016";
  const address = settings?.address || "Northern Sky Apartments, 1704, B Block, Pumpwell, Mangalore.";
  const phone = settings?.support_phone || "+91 95679 03350";

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    toast.success("Thanks for subscribing! Check your inbox 💌");
    setEmail("");
  };

  return (
    <footer className="bg-cream border-t mt-20">
      {/* Shipping ribbon */}
      <div className="bg-foreground text-background text-[11px] uppercase tracking-[0.25em] py-3 text-center px-4 flex items-center justify-center gap-2">
        <Truck className="size-3.5" />
        Shipping all over India
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top row: logo left */}
        <div className="flex items-center gap-4 mb-10">
          <img src={logoUrl} alt={storeName} className="h-12 md:h-16 w-auto shrink-0" />
          <div>
            <h3 className="font-display text-xl tracking-[0.2em] font-bold">{storeName}</h3>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">
              {tagline}
            </p>
          </div>
        </div>

        {/* Desktop 4-col grid */}
        <div className="hidden md:grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl tracking-[0.2em] font-bold mb-4">
              {storeName}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Made using clean, non-toxic ingredients, our products are designed for everyone.
            </p>
            <address className="text-sm text-muted-foreground not-italic">
              {address}<br />
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-rose">{phone}</a>
            </address>
          </div>
          {linkCols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink label={l.label} slug={l.slug} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile: single column accordion */}
        <div className="md:hidden">
          <div className="mb-6">
            <h3 className="font-display text-xl tracking-[0.2em] font-bold mb-3">
              {storeName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Made using clean, non-toxic ingredients, our products are designed for everyone.
            </p>
          </div>
          <Accordion type="single" collapsible>
            {linkCols.map((col) => (
              <AccordionItem key={col.title} value={col.title}>
                <AccordionTrigger className="text-sm uppercase tracking-wider font-display">
                  {col.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <FooterLink label={l.label} slug={l.slug} />
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-10 border-t">
          <div className="max-w-md">
            <h4 className="font-display text-lg mb-2 uppercase tracking-widest">
              Give your inbox some love
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              New products, tips, & more — delivered with care.
            </p>
            <form onSubmit={onSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
              >
                Subscribe
              </button>
            </form>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://instagram.com" aria-label="Instagram" className="hover:text-rose min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Instagram className="size-5" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="hover:text-rose min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Facebook className="size-5" />
              </a>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                aria-label="WhatsApp"
                className="hover:text-emerald-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest flex-wrap">
            <span className="px-2 py-1 border rounded">Visa</span>
            <span className="px-2 py-1 border rounded">Mastercard</span>
            <span className="px-2 py-1 border rounded">UPI</span>
            <span className="px-2 py-1 border rounded">Razorpay</span>
            <span className="px-2 py-1 border rounded">Apple Pay</span>
          </div>
          <div className="text-center md:text-right">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
