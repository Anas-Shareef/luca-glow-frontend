import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Search, Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminInput } from "@/components/admin/AdminInput";
import { supabase } from "@/integrations/supabase/client";
import { formatPaise } from "@/store/shop";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — LUCA Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <ProductsPage />
    </AdminGuard>
  ),
});

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price_paise: number;
  compare_at_price_paise: number | null;
  stock: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  categories?: { name: string } | null;
};

function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "hidden" | "low-stock">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id,name,slug,price_paise,compare_at_price_paise,stock,images,is_active,is_featured,category_id,categories(name)")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts((data as unknown as ProductRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (filter === "active") return p.is_active;
      if (filter === "hidden") return !p.is_active;
      if (filter === "low-stock") return p.stock < 10;
      return true;
    });

  const handleDelete = async (p: ProductRow) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    load();
  };

  const toggleActive = async (p: ProductRow) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <AdminLayout
      title="Products"
      actions={
        <Link
          to="/admin/products/$id" params={{ id: "new" }}
          className="bg-[#1A2F23] hover:bg-[#2E5041] text-white text-sm font-medium rounded-lg px-4 py-2.5 flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="size-4" /> <span className="hidden sm:inline">New product</span>
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9E9E9E]" />
          <AdminInput
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-lg p-1 overflow-x-auto">
          {(["all", "active", "hidden", "low-stock"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-[#1A2F23] text-white text-xs uppercase tracking-widest px-3 py-2 rounded-md whitespace-nowrap"
                  : "text-[#6B6B6B] hover:text-[#1A2F23] text-xs uppercase tracking-widest px-3 py-2 rounded-md whitespace-nowrap"
              }
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="size-6 text-[#1A2F23] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9E9E9E]">
            {products.length === 0 ? (
              <>
                <p className="mb-3">No products yet.</p>
                <Link
                  to="/admin/products/$id" params={{ id: "new" }}
                  className="inline-flex items-center gap-2 bg-[#1A2F23] text-white rounded-lg px-4 py-2.5 text-sm font-medium"
                >
                  <Plus className="size-4" /> Create your first product
                </Link>
              </>
            ) : (
              "No products match these filters."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9F6F1] text-left text-[11px] uppercase tracking-widest text-[#6B6B6B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-[#E8E4DF] hover:bg-[#F9F6F1]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-md bg-[#F9F6F1] overflow-hidden border border-[#E8E4DF] shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#1A2F23] truncate flex items-center gap-1.5">
                            {p.name}
                            {p.is_featured && <Star className="size-3.5 text-[#D4AF37] fill-[#D4AF37]" />}
                          </p>
                          <p className="text-[11px] text-[#9E9E9E] truncate">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B] hidden md:table-cell">
                      {p.categories?.name ?? <span className="text-[#9E9E9E]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A2F23]">{formatPaise(p.price_paise)}</p>
                      {p.compare_at_price_paise && p.compare_at_price_paise > p.price_paise ? (
                        <p className="text-[11px] text-[#9E9E9E] line-through">
                          {formatPaise(p.compare_at_price_paise)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={
                          p.stock === 0
                            ? "text-[#C0392B] font-medium"
                            : p.stock < 10
                              ? "text-[#E67E22] font-medium"
                              : "text-[#3A6B52]"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={
                          p.is_active
                            ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest bg-[#3A6B52]/10 text-[#3A6B52]"
                            : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest bg-[#9E9E9E]/10 text-[#9E9E9E]"
                        }
                      >
                        {p.is_active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {p.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Link
                          to="/admin/products/$id"
                          params={{ id: p.id }}
                          className="size-9 rounded-lg hover:bg-[#1A2F23]/5 text-[#1A2F23] flex items-center justify-center"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          className="size-9 rounded-lg hover:bg-[#C0392B]/10 text-[#C0392B] flex items-center justify-center"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
