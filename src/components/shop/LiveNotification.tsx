import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, X, ExternalLink, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "purchase" | "view";
  productName: string;
  productSlug: string;
  image: string;
  location: string;
  time: string;
  hasLocationLink?: boolean;
}

const CITIES = [
  "Mumbai, India", "Dubai, UAE", "New Delhi, India", "Abu Dhabi, UAE",
  "Bangalore, India", "Sharjah, UAE", "Chennai, India", "Hyderabad, India",
  "Kolkata, India", "Pune, India", "Ahmedabad, India", "Ajman, UAE"
];

const ACTIONS = [
  "just purchased", "is viewing", "added to wishlist", "just ordered"
];

export function LiveNotification() {
  const { products } = useProducts();
  const [current, setCurrent] = useState<Activity | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!products.length) return;

    const showRandom = () => {
      const product = products[Math.floor(Math.random() * products.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      
      const newActivity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        type: action.includes("purchased") || action.includes("ordered") ? "purchase" : "view",
        productName: product.name,
        productSlug: product.slug,
        image: product.image,
        location: city,
        time: "a few seconds ago",
        // Simulate some having a "location link" (e.g. tracking or store map)
        hasLocationLink: Math.random() > 0.5 
      };

      setCurrent(newActivity);
      setIsVisible(true);

      // Hide after 6 seconds
      setTimeout(() => setIsVisible(false), 6000);
    };

    // First one after 5 seconds
    const initialTimer = setTimeout(showRandom, 5000);

    // Then every 25-40 seconds
    const interval = setInterval(() => {
      showRandom();
    }, 30000 + Math.random() * 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products]);

  return (
    <AnimatePresence>
      {isVisible && current && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 max-w-[320px] w-full"
        >
          <div className="bg-background border shadow-2xl rounded-xl p-4 flex gap-4 relative overflow-hidden group">
            {/* Progress bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-rose/30"
            />

            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={14} className="text-muted-foreground" />
            </button>

            <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <img 
                src={current.image} 
                alt={current.productName} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose">
                  Live Activity
                </p>
              </div>
              
              <p className="text-[13px] leading-tight mb-1">
                Someone in <span className="font-semibold">{current.location}</span>{" "}
                {current.type === "purchase" ? "just bought" : "is browsing"}
              </p>
              
              <p className="text-[13px] font-bold truncate mb-2 pr-4">
                {current.productName}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  to="/products/$slug"
                  params={{ slug: current.productSlug }}
                  className="text-[11px] font-black uppercase tracking-widest text-foreground hover:text-rose flex items-center gap-1 group/btn"
                >
                  View Product <ExternalLink size={10} className="transition-transform group-hover/btn:translate-x-0.5" />
                </Link>

                {current.type === "purchase" && (
                  <button className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <MapPin size={10} /> Track
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
