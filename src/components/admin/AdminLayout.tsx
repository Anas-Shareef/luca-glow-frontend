import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layout as LayoutIcon,
  Tag,
  Users,
  Star,
  Mail,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import lucaLogo from "@/assets/luca-logo.png";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catalogue",
    items: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/categories", label: "Categories", icon: Package },
    ],
  },
  {
    title: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/coupons", label: "Coupons", icon: Tag },
    ],
  },
  {
    title: "Content",
    items: [{ to: "/admin/content", label: "CMS", icon: LayoutIcon }],
  },
  {
    title: "Customers",
    items: [
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
      { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    title: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function AdminLayout({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] bg-[#1A2F23] text-white flex-col z-40">
        <SidebarContent currentPath={location.pathname} onLogout={handleLogout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-[#1A2F23] text-white flex flex-col z-50 lg:hidden animate-in slide-in-from-left">
            <button
              className="absolute top-4 right-4 p-1 text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent
              currentPath={location.pathname}
              onLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E8E4DF] h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5 text-[#1A2F23]" />
            </button>
            <div className="min-w-0">
              <Breadcrumb path={location.pathname} />
              <h1 className="text-lg sm:text-xl font-bold text-[#1A2F23] truncate">{title}</h1>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1440px] w-full">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPath,
  onLogout,
  onNavigate,
}: {
  currentPath: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="bg-white rounded-md p-1.5">
          <img src={lucaLogo} alt="LUCA" className="h-7 w-auto" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest">LUCA</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-6 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
              {group.title}
            </p>
            <ul>
              {group.items.map((item) => {
                const active = currentPath === item.to || currentPath.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-3 px-6 py-2.5 text-sm transition-colors min-h-[44px]",
                        active
                          ? "bg-[#2E5041] text-[#F9F6F1] font-medium"
                          : "text-white/70 hover:bg-[#2E5041]/60 hover:text-white",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
                      )}
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors min-h-[44px]"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
        <Link
          to="/"
          className="block text-center text-[11px] text-white/50 hover:text-white/80 mt-3 uppercase tracking-widest"
        >
          ← Back to storefront
        </Link>
      </div>
    </>
  );
}

function Breadcrumb({ path }: { path: string }) {
  const segments = path.split("/").filter(Boolean);
  return (
    <div className="hidden sm:flex items-center text-[11px] uppercase tracking-widest text-[#9E9E9E] gap-1">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3" />}
          <span className={i === segments.length - 1 ? "text-[#1A2F23]" : ""}>{seg}</span>
        </span>
      ))}
    </div>
  );
}
