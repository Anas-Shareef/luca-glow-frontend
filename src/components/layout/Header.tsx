import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShop, cartCount } from "@/store/shop";
import { useSettings } from "@/store/settings";
import lucaLogoFallback from "@/assets/luca-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchModal } from "@/components/shop/SearchModal";

const catalogColumns = [
  {
    title: "Skincare & Face",
    slug: "skincare-face",
    links: [
      { label: "Face Cream", slug: "face-cream" },
      { label: "Sun Protection", slug: "sun-protection" },
      { label: "Kojic Facewash", slug: "kojic-facewash" },
      { label: "Fairness Cream", slug: "fairness-cream" },
      { label: "Lipbalm", slug: "lipbalm" },
    ],
  },
  {
    title: "Cleansing Soaps",
    slug: "cleansing-soaps",
    links: [
      { label: "Gluta Soap", slug: "gluta-soap" },
      { label: "Golden Soap", slug: "golden-soap" },
      { label: "Goat Milk Soap", slug: "goat-milk-soap" },
    ],
  },
  {
    title: "Lykha Makeup",
    slug: "lykha-makeup",
    links: [
      { label: "Foundations", slug: "lykha-makeup", isCollection: true },
      { label: "4-in-1 Lipstick", slug: "4in1-lipstick" },
    ],
  },
  {
    title: "Fragrances",
    slug: "fragrances",
    links: [
      { label: "Full Perfume", slug: "perfume-full" },
      { label: "Pocket Perfume", slug: "pocket-perfume" },
    ],
  },
  {
    title: "Body & Hair Care",
    slug: "body-hair-care",
    links: [
      { label: "Hand Cream", slug: "hand-cream" },
      { label: "Beard Oil", slug: "beard-oil" },
      { label: "Hair Oil", slug: "hair-oil" },
    ],
  },
];

const promo = {
  tag: "New Arrival",
  title: "Lykha Foundations",
  subtitle: "Glow Beyond Limits",
  image:
    "https://images.unsplash.com/photo-1631730486572-226d1f595b68?auto=format&fit=crop&w=600&q=80",
  slug: "lykha-makeup",
};

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const settings = useSettings((s) => s.settings);

  const logoUrl = settings?.logo_url || lucaLogoFallback;
  const storeName = settings?.store_name || "LUCA";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur shadow-sm"
            : "bg-background/90 backdrop-blur-sm",
        )}
      >
        {/* Announcement bar */}
        <div className="bg-foreground text-background text-[11px] uppercase tracking-[0.2em] py-2 text-center px-4">
          Shipping all over India · Cruelty-free · Made with love
        </div>

        <div
          className={cn(
            "mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center transition-all",
            scrolled ? "h-14" : "h-16 md:h-20",
          )}
        >
          {/* Mobile/Tablet: Hamburger (left) */}
          <div className="lg:hidden">
            <MobileMenu logoUrl={logoUrl} storeName={storeName} />
          </div>

          {/* Mobile/Tablet: Logo centered */}
          <div className="lg:hidden flex-1 flex justify-center">
            <Link to="/" aria-label={`${storeName} Home`}>
              <img
                src={logoUrl}
                alt={storeName}
                className="h-8 md:h-10 w-auto"
              />
            </Link>
          </div>

          {/* Mobile/Tablet: Right icons (search + bag) */}
          <div className="lg:hidden flex items-center gap-0.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-rose transition-colors"
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-rose transition-colors relative"
              aria-label="Bag"
            >
              <ShoppingBag className="size-5" />
              {cartCount(cart) > 0 && (
                <span className="absolute top-1 right-1 bg-rose text-primary-foreground text-[10px] rounded-full size-4 flex items-center justify-center">
                  {cartCount(cart)}
                </span>
              )}
            </button>
          </div>

          {/* Desktop: Logo left */}
          <Link
            to="/"
            className="hidden lg:flex items-center"
            aria-label={`${storeName} Home`}
          >
            <img
              src={logoUrl}
              alt={storeName}
              className="h-[45px] w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] uppercase tracking-[0.18em] font-medium ml-6 mr-auto">
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu(true)}
              onMouseLeave={() => setOpenMenu(false)}
            >
              <Link
                to="/catalog"
                className="hover:text-rose transition-colors py-2 inline-flex items-center gap-1"
                activeProps={{ className: "text-rose" }}
              >
                Catalog <ChevronDown className="size-3" />
              </Link>
              {openMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="bg-background border rounded-lg shadow-2xl p-6 w-[920px] grid grid-cols-[repeat(5,1fr)_220px] gap-6">
                    {catalogColumns.map((col) => (
                      <div key={col.title}>
                        <Link
                          to="/collections/$slug"
                          params={{ slug: col.slug }}
                          className="block font-display text-xs uppercase tracking-[0.2em] font-bold mb-3 hover:text-rose"
                        >
                          {col.title}
                        </Link>
                        <ul className="space-y-1.5">
                          {col.links.map((l) => (
                            <li key={l.label}>
                              <Link
                                to={l.isCollection ? "/collections/$slug" : "/products/$slug"}
                                params={{ slug: l.slug }}
                                className="text-xs normal-case tracking-normal text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link to="/collections/$slug" params={{ slug: promo.slug }} className="group block">
                      <div className="relative overflow-hidden rounded-md aspect-[3/4]">
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 bg-background text-foreground text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-[#D4AF37] text-[#8a6d1c]">
                          {promo.tag}
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 bg-background/95 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold leading-tight">
                            {promo.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground normal-case mt-0.5">
                            {promo.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to="/collections/$slug" params={{ slug: "men" }} className="font-bold hover:text-rose">
              Men
            </Link>
            <Link to="/collections/$slug" params={{ slug: "women" }} className="hover:text-rose">
              Women
            </Link>
            <Link to="/contact" className="hover:text-rose">
              Contact
            </Link>
          </nav>

          {/* Desktop right cluster */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:text-rose transition-colors"
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>
            <Link
              to="/account"
              className="p-2 hover:text-rose transition-colors"
              aria-label="Account"
            >
              <User className="size-5" />
            </Link>
            <Link
              to="/wishlist"
              className="p-2 hover:text-rose transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose text-primary-foreground text-[10px] rounded-full size-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 hover:text-rose transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Bag"
            >
              <ShoppingBag className="size-5" />
              {cartCount(cart) > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose text-primary-foreground text-[10px] rounded-full size-4 flex items-center justify-center">
                  {cartCount(cart)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileMenu({ logoUrl, storeName }: { logoUrl: string; storeName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm p-0 [&>button.absolute]:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <img src={logoUrl} alt={storeName} className="h-10 w-auto" />
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-65px)]">
          <Link
            to="/catalog"
            onClick={() => setOpen(false)}
            className="block py-3 text-base font-bold uppercase tracking-widest border-b"
          >
            Catalog Home
          </Link>
          <Accordion type="multiple" className="w-full">
            {catalogColumns.map((col) => (
              <AccordionItem key={col.title} value={col.title}>
                <AccordionTrigger className="text-sm uppercase tracking-widest">
                  {col.title}
                </AccordionTrigger>
                <AccordionContent>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: col.slug }}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-medium text-rose"
                  >
                    Shop all
                  </Link>
                  {col.links.map((l) => (
                    <Link
                      key={l.label}
                      to={l.isCollection ? "/collections/$slug" : "/products/$slug"}
                      params={{ slug: l.slug }}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-4 space-y-1 pt-4 border-t">
            <Link
              to="/collections/$slug"
              params={{ slug: "men" }}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-bold uppercase tracking-widest"
            >
              Men
            </Link>
            <Link
              to="/collections/$slug"
              params={{ slug: "women" }}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium uppercase tracking-widest"
            >
              Women
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium uppercase tracking-widest"
            >
              Contact
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t space-y-3">
            <Link to="/account" onClick={() => setOpen(false)} className="block text-sm">
              My Account
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="block text-sm">
              Wishlist
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
