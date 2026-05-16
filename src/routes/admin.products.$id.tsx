import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminInput, AdminSelect, AdminTextarea, Field, slugify } from "@/components/admin/AdminInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({
    meta: [
      { title: "Edit product — LUCA Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <ProductFormPage />
    </AdminGuard>
  ),
});

type Category = { id: string; name: string };

type ProductData = {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string | null;
  price_paise: number;
  compare_at_price_paise: number | null;
  sku: string;
  stock: number;
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
};

const empty: ProductData = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  category_id: null,
  price_paise: 0,
  compare_at_price_paise: null,
  sku: "",
  stock: 0,
  images: [],
  tags: [],
  is_active: true,
  is_featured: false,
};

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z.string().trim().min(1, "Slug is required").max(120).regex(/^[a-z0-9-]+$/, "Lowercase, numbers, dashes only"),
  price_paise: z.number().int().min(0, "Price must be ≥ 0"),
  compare_at_price_paise: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0, "Stock must be ≥ 0"),
  sku: z.string().max(60).optional().nullable(),
});

function ProductFormPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [data, setData] = useState<ProductData>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Load categories
  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name")
      .order("sort_order")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  // Load product when editing
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (error || !row) {
          toast.error(error?.message ?? "Product not found");
          navigate({ to: "/admin/products" });
          return;
        }
        setData({
          name: row.name,
          slug: row.slug,
          description: row.description ?? "",
          short_description: row.short_description ?? "",
          category_id: row.category_id,
          price_paise: row.price_paise,
          compare_at_price_paise: row.compare_at_price_paise,
          sku: row.sku ?? "",
          stock: row.stock,
          images: row.images ?? [],
          tags: row.tags ?? [],
          is_active: row.is_active,
          is_featured: row.is_featured,
        });
        setLoading(false);
      });
  }, [id, isNew, navigate]);

  const set = <K extends keyof ProductData>(k: K, v: ProductData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const handleNameChange = (v: string) => {
    set("name", v);
    if (isNew) set("slug", slugify(v));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!data.tags.includes(t)) set("tags", [...data.tags, t]);
    setTagInput("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = productSchema.safeParse({
      name: data.name,
      slug: data.slug,
      price_paise: data.price_paise,
      compare_at_price_paise: data.compare_at_price_paise,
      stock: data.stock,
      sku: data.sku || null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSaving(true);
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      short_description: data.short_description || null,
      category_id: data.category_id,
      price_paise: data.price_paise,
      compare_at_price_paise: data.compare_at_price_paise,
      sku: data.sku || null,
      stock: data.stock,
      images: data.images,
      tags: data.tags,
      is_active: data.is_active,
      is_featured: data.is_featured,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Product created" : "Saved");
    navigate({ to: "/admin/products" });
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${data.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    navigate({ to: "/admin/products" });
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Loading…">
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[#1A2F23]" />
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New product" : data.name || "Edit product"}
      actions={
        <div className="flex gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="hidden sm:inline-flex items-center gap-2 text-[#C0392B] hover:bg-[#C0392B]/10 rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px]"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          )}
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="bg-[#1A2F23] hover:bg-[#2E5041] disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 flex items-center gap-2 min-h-[44px]"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span className="hidden sm:inline">{isNew ? "Create" : "Save"}</span>
          </button>
        </div>
      }
    >
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#6B6B6B] hover:text-[#1A2F23] mb-4"
      >
        <ArrowLeft className="size-3.5" /> Back to products
      </Link>

      <form id="product-form" onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Basics">
            <Field label="Name" required>
              <AdminInput value={data.name} onChange={(e) => handleNameChange(e.target.value)} />
            </Field>
            <Field label="Slug" hint="URL: /products/your-slug" required>
              <AdminInput value={data.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <Field label="Short description" hint="Shown on product cards (1–2 lines)">
              <AdminInput
                value={data.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                maxLength={160}
              />
            </Field>
            <Field label="Description">
              <AdminTextarea
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
              />
            </Field>
          </Card>

          <Card title="Images" subtitle="The first image is used as the main thumbnail.">
            <ImageUploader value={data.images} onChange={(v) => set("images", v)} max={6} />
          </Card>

          <Card title="Pricing & inventory">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Price (₹)" required>
                <AdminInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={(data.price_paise / 100).toString()}
                  onChange={(e) => set("price_paise", Math.round(Number(e.target.value) * 100))}
                />
              </Field>
              <Field label="Compare-at price (₹)" hint="Optional. Shows a strike-through.">
                <AdminInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={
                    data.compare_at_price_paise != null
                      ? (data.compare_at_price_paise / 100).toString()
                      : ""
                  }
                  onChange={(e) =>
                    set(
                      "compare_at_price_paise",
                      e.target.value ? Math.round(Number(e.target.value) * 100) : null,
                    )
                  }
                />
              </Field>
              <Field label="SKU" hint="Internal stock-keeping code">
                <AdminInput value={data.sku} onChange={(e) => set("sku", e.target.value)} />
              </Field>
              <Field label="Stock">
                <AdminInput
                  type="number"
                  min={0}
                  value={data.stock}
                  onChange={(e) => set("stock", Number(e.target.value))}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card title="Visibility">
            <div className="space-y-3">
              <Toggle
                label="Active"
                hint="Visible on the storefront"
                value={data.is_active}
                onChange={(v) => set("is_active", v)}
              />
              <Toggle
                label="Featured"
                hint="Appears in featured sliders"
                value={data.is_featured}
                onChange={(v) => set("is_featured", v)}
              />
            </div>
          </Card>

          <Card title="Organization">
            <Field label="Category">
              <AdminSelect
                value={data.category_id ?? ""}
                onChange={(e: any) => set("category_id", e.target.value || null)}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>
            </Field>
            <Field label="Tags" hint="Press Enter to add">
              <div className="flex gap-2">
                <AdminInput
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="vegan, ayurvedic…"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-[#F9F6F1] hover:bg-[#E8E4DF] text-[#1A2F23] rounded-lg px-3 text-sm font-medium min-h-[44px]"
                >
                  Add
                </button>
              </div>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.tags.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => set("tags", data.tags.filter((x) => x !== t))}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-[#1A2F23]/5 text-[#1A2F23] hover:bg-[#C0392B]/10 hover:text-[#C0392B]"
                    >
                      {t} ×
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </Card>

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="sm:hidden w-full inline-flex items-center justify-center gap-2 text-[#C0392B] hover:bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-lg px-4 py-3 text-sm font-medium min-h-[44px]"
            >
              <Trash2 className="size-4" /> Delete product
            </button>
          )}
        </div>
      </form>
    </AdminLayout>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm space-y-4">
      <header>
        <h2 className="text-base font-semibold text-[#1A2F23]">{title}</h2>
        {subtitle && <p className="text-xs text-[#9E9E9E] mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-[#F9F6F1] text-left min-h-[44px]"
    >
      <div>
        <p className="text-sm font-medium text-[#1A2F23]">{label}</p>
        {hint && <p className="text-[11px] text-[#9E9E9E]">{hint}</p>}
      </div>
      <span
        className={
          value
            ? "relative w-10 h-6 rounded-full bg-[#1A2F23] transition-colors"
            : "relative w-10 h-6 rounded-full bg-[#E8E4DF] transition-colors"
        }
      >
        <span
          className={
            value
              ? "absolute top-0.5 left-[18px] size-5 bg-white rounded-full shadow-sm transition-all"
              : "absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow-sm transition-all"
          }
        />
      </span>
    </button>
  );
}
