"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  ImageOff,
  UploadCloud,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  active: boolean;
};

type PanelState =
  | { mode: "idle" }
  | { mode: "add" }
  | { mode: "edit"; product: Product };

const emptyForm = {
  name: "",
  slug: "",
  category: "",
  price: "",
  unit: "",
  imageUrl: "",
  description: "",
  active: true,
};

const CATEGORY_SUGGESTIONS = ["Vegetables", "Grains & staples", "Pantry"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
] as const;

export function ProductsManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [form, setForm] = useState({ ...emptyForm });
  const [slugTouched, setSlugTouched] = useState(false);
  const [panel, setPanel] = useState<PanelState>({ mode: "idle" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isFormOpen = panel.mode !== "idle";

  const filtered = products.filter((p) => {
    if (filter === "active") return p.active;
    if (filter === "inactive") return !p.active;
    return true;
  });

  function openAdd() {
    setForm({ ...emptyForm });
    setSlugTouched(false);
    setError(null);
    setPanel({ mode: "add" });
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: String(product.price),
      unit: product.unit ?? "",
      imageUrl: product.imageUrl ?? "",
      description: product.description ?? "",
      active: product.active,
    });
    setSlugTouched(true);
    setError(null);
    setPanel({ mode: "edit", product });
  }

  function closePanel() {
    setForm({ ...emptyForm });
    setSlugTouched(false);
    setError(null);
    setPanel({ mode: "idle" });
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Images must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const signResponse = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, folder: "products" }),
      });
      const signed = await signResponse.json();
      if (!signResponse.ok || !signed.success) throw new Error(signed.error ?? "Could not prepare upload");
      const uploadResponse = await fetch(signed.data.upload.uploadUrl, {
        method: "PUT",
        headers: signed.data.upload.headers,
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("Image upload failed");
      setForm((previous) => ({ ...previous, imageUrl: signed.data.upload.publicUrl }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const editingId = panel.mode === "edit" ? panel.product.id : null;
    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      category: form.category,
      price,
      unit: form.unit || undefined,
      imageUrl: form.imageUrl || undefined,
      description: form.description || undefined,
      active: form.active,
    };

    try {
      const res = await fetch(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't save product. Please try again.");
        return;
      }

      const saved: Product = json.data.product;
      setProducts((prev) =>
        editingId
          ? prev.map((p) => (p.id === editingId ? saved : p))
          : [saved, ...prev],
      );
      closePanel();
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't delete product.");
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (panel.mode === "edit" && panel.product.id === id) closePanel();
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
      setConfirmingDelete(null);
    }
  }

  async function toggleActive(product: Product) {
    setBusyId(product.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't update product.");
        return;
      }
      const saved: Product = json.data.product;
      setProducts((prev) => prev.map((p) => (p.id === product.id ? saved : p)));
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-[#24402F] text-white"
                    : "border border-[#E4DCC8] text-[#6B6558] hover:bg-[#17251C]/[0.04]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#24402F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a2f22]"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        <div className="flex flex-col gap-3">
          {error && (
            <p className="rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-4 py-3 text-sm text-[#B3261E]">
              {error}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-[#E4DCC8] bg-white py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF0E7] text-[#24402F]">
                <Package className="h-5 w-5" />
              </div>
              <p className="mt-2 text-sm font-medium text-[#17251C]">
                {products.length === 0
                  ? "No products yet"
                  : "Nothing matches this filter"}
              </p>
              {products.length === 0 && (
                <>
                  <p className="max-w-xs text-sm text-[#6B6558]">
                    Add the items that show up in your storefront catalog.
                  </p>
                  <button
                    type="button"
                    onClick={openAdd}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#24402F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a2f22]"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first product
                  </button>
                </>
              )}
            </div>
          ) : (
            filtered.map((product) => {
              const isConfirming = confirmingDelete === product.id;
              const isBusy = busyId === product.id;
              const isEditingThis =
                panel.mode === "edit" && panel.product.id === product.id;
              return (
                <div
                  key={product.id}
                  className={`rounded-3xl border bg-white p-5 transition ${
                    isEditingThis
                      ? "border-[#24402F] shadow-[0_20px_50px_rgba(23,37,28,0.08)]"
                      : "border-[#E4DCC8]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#EDF0E7] text-[#24402F]">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-[#17251C]">
                          {product.name}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              product.active
                                ? "bg-[#EDF0E7] text-[#24402F]"
                                : "border border-[#E4DCC8] text-[#6B6558]"
                            }`}
                          >
                            {product.active ? "Active" : "Inactive"}
                          </span>
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#6B6558]">
                          {product.category}
                          {product.unit ? ` · ${product.unit}` : ""} · ₦
                          {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-[#F1EFE5] pt-4 text-sm">
                    {isConfirming ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#6B6558]">
                          Delete this product?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={isBusy}
                          className="rounded-full bg-[#B3261E] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#96201A] disabled:opacity-60"
                        >
                          {isBusy ? "Deleting…" : "Confirm delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(null)}
                          className="text-xs font-medium text-[#6B6558] underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(product)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#6B6558] transition hover:bg-[#17251C]/[0.04] disabled:opacity-60"
                        >
                          {product.active ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          {isBusy
                            ? "Updating…"
                            : product.active
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(product.id)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#B3261E] transition hover:bg-[#FBEAE7]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="h-fit rounded-3xl border border-[#E4DCC8] bg-white p-6 lg:sticky lg:top-8">
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#BC8A31]">
                    {panel.mode === "edit" ? "Edit" : "New"}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-[#17251C]">
                    {panel.mode === "edit"
                      ? "Edit product"
                      : "Add a new product"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6558] transition hover:bg-[#17251C]/[0.04] hover:text-[#17251C]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Field label="Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>

              <Field label="Slug">
                <input
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>

              <Field label="Category">
                <input
                  required
                  list="product-categories"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
                <datalist id="product-categories">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₦)">
                  <input
                    required
                    type="number"
                    min={0}
                    step={50}
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                  />
                </Field>
                <Field label="Unit (optional)">
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="kg, basket, pack…"
                    className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                  />
                </Field>
              </div>

              <Field label="Product image (optional)">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#E4DCC8] px-3.5 py-3 text-sm text-[#6B6558] transition hover:bg-[#17251C]/[0.04]">
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? "Uploading…" : form.imageUrl ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" disabled={uploading} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleImageUpload(file); event.target.value = ""; }} />
                </label>
                {form.imageUrl && <p className="truncate text-xs text-[#6B6558]">Image ready</p>}
              </Field>

              <Field label="Description (optional)">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm text-[#17251C]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#E4DCC8]"
                />
                Visible in storefront
              </label>

              {error && (
                <p className="rounded-xl border border-[#F3D4CF] bg-[#FBEAE7] px-3 py-2 text-sm text-[#B3261E]">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-full bg-[#24402F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
                >
                  {saving
                    ? "Saving…"
                    : panel.mode === "edit"
                      ? "Save changes"
                      : "Add product"}
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-full border border-[#E4DCC8] px-5 py-2.5 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDF0E7] text-[#24402F]">
                <Package className="h-5 w-5" />
              </div>
              <p className="mt-1 text-sm font-medium text-[#17251C]">
                Nothing selected
              </p>
              <p className="max-w-[220px] text-sm text-[#6B6558]">
                Choose a product to edit, or add a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#17251C]">{label}</label>
      {children}
    </div>
  );
}
