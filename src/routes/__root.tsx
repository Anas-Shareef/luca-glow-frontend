import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import appCss from "../styles.css?url";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { WhatsAppFab } from "@/components/shop/WhatsAppFab";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useSettings } from "@/store/settings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Luca Cosmetics | Feel The Change | Clean Beauty" },
      {
        name: "description",
        content:
          "Luca Cosmetics — clean, non-toxic, cruelty-free skincare, haircare, and lipcare designed for everyone.",
      },
      { name: "author", content: "Luca World" },
      { property: "og:title", content: "Luca Cosmetics | Feel The Change | Clean Beauty" },
      {
        property: "og:description",
        content: "Clean, non-toxic beauty. Cruelty-free. Made for everyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Luca Cosmetics | Feel The Change | Clean Beauty" },
      { name: "description", content: "Luca Cosmetics offers a premium, responsive e-commerce experience for clean beauty enthusiasts." },
      { property: "og:description", content: "Luca Cosmetics offers a premium, responsive e-commerce experience for clean beauty enthusiasts." },
      { name: "twitter:description", content: "Luca Cosmetics offers a premium, responsive e-commerce experience for clean beauty enthusiasts." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/PcaKSS0bS5cMKUZiONmkW6ufmp22/social-images/social-1776820643202-Lucasworld.shop-removebg-preview.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/PcaKSS0bS5cMKUZiONmkW6ufmp22/social-images/social-1776820643202-Lucasworld.shop-removebg-preview.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const queryClient = new QueryClient();

import { LiveNotification } from "@/components/shop/LiveNotification";

function RootComponent() {
  const fetchSettings = useSettings((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <WhatsAppFab />
        <LiveNotification />
        <Toaster position="bottom-right" />
      </div>
    </QueryClientProvider>
  );
}
