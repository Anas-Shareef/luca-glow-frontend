import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminInput, AdminTextarea, Field, slugify } from "@/components/admin/AdminInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — LUCA Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <CategoriesPage />
    </AdminGuard>
  ),
});

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z.string().trim().min(1, "Slug is required").max(80).regex(/^[a-z0-9-]+$/, "Lowercase, numbers, and dashes only"),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) toast.error(error.message);
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? Products will be unassigned.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", cat.id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    load();
  };

  return (
    <AdminLayout
      title="Categories"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="bg-[#1A2F23] hover:bg-[#2E5041] text-white text-sm font-medium rounded-lg px-4 py-2.5 flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="size-4" /> <span className="hidden sm:inline">New category</span>
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9E9E9E]" />
        <AdminInput
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="size-6 text-[#1A2F23] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9E9E9E]">
            {categories.length === 0
              ? "No categories yet. Create your first one to get started."
              : "No categories match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9F6F1] text-left text-[11px] uppercase tracking-widest text-[#6B6B6B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Slug</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-[#E8E4DF] hover:bg-[#F9F6F1]/50">
                    <td className="px-4 py-3">
                      <div className="size-10 rounded-md bg-[#F9F6F1] overflow-hidden border border-[#E8E4DF]">
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A2F23]">{c.name}</td>
                    <td className="px-4 py-3 text-[#6B6B6B] hidden sm:table-cell">{c.slug}</td>
                    <td className="px-4 py-3 text-[#6B6B6B] hidden md:table-cell">{c.sort_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.is_active
                            ? "inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest bg-[#3A6B52]/10 text-[#3A6B52]"
                            : "inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest bg-[#9E9E9E]/10 text-[#9E9E9E]"
                        }
                      >
                        {c.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setEditing(c)}
                          className="size-9 rounded-lg hover:bg-[#1A2F23]/5 text-[#1A2F23] flex items-center justify-center"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
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

      {(creating || editing) && (
        <CategoryModal
          category={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(category?.image_url ? [category.image_url] : []);
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!category) setSlug(slugify(v));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = categorySchema.safeParse({
      name,
      slug,
      description: description || undefined,
      image_url: imageUrls[0] ?? "",
      sort_order: Number(sortOrder),
      is_active: isActive,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const payload = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      image_url: imageUrls[0] ?? null,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    };
    const { error } = category
      ? await supabase.from("categories").update(payload).eq("id", category.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(category ? "Category updated" : "Category created");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#E8E4DF] px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1A2F23]">
            {category ? "Edit category" : "New category"}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-[#6B6B6B] hover:text-[#1A2F23]">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Name" required>
            <AdminInput value={name} onChange={(e) => handleNameChange(e.target.value)} />
          </Field>
          <Field label="Slug" hint="Used in the URL, e.g. /collections/face-care" required>
            <AdminInput value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field label="Description">
            <AdminTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Cover image">
            <ImageUploader
              value={imageUrls}
              onChange={setImageUrls}
              pathPrefix="categories"
              max={1}
              multiple={false}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sort order">
              <AdminInput
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </Field>
            <Field label="Status">
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={
                  isActive
                    ? "w-full min-h-[44px] rounded-lg bg-[#3A6B52]/10 text-[#3A6B52] text-sm font-medium border border-[#3A6B52]/20"
                    : "w-full min-h-[44px] rounded-lg bg-[#9E9E9E]/10 text-[#6B6B6B] text-sm font-medium border border-[#E8E4DF]"
                }
              >
                {isActive ? "Active" : "Hidden"}
              </button>
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E8E4DF] px-5 py-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-[#6B6B6B] hover:text-[#1A2F23] min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1A2F23] hover:bg-[#2E5041] disabled:opacity-60 text-white text-sm font-medium rounded-lg px-5 py-2.5 flex items-center gap-2 min-h-[44px]"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {category ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}
