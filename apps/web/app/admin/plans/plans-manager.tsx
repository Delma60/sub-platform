"use client";

import { useState, type FormEvent } from "react";
import { ClipboardList, Pencil, Plus, X } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: number;
  frequency: "weekly" | "biweekly" | "monthly";
  features: string[];
};

const FREQUENCIES: { value: Plan["frequency"]; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

export function PlansManager({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    frequency: "monthly" as Plan["frequency"],
    features: [""],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEdit(plan: Plan) {
    setForm({
      name: plan.name,
      price: String(plan.price),
      frequency: plan.frequency,
      features: plan.features.length ? [...plan.features] : [""],
    });
    setError(null);
    setSelectedId(plan.id);
  }

  function closePanel() {
    setSelectedId(null);
    setError(null);
  }

  function updateFeature(index: number, value: string) {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  }

  function addFeature() {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  }

  function removeFeature(index: number) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    const features = form.features.map((f) => f.trim()).filter(Boolean);
    if (features.length === 0) {
      setError("Add at least one feature.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/plans/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price,
          frequency: form.frequency,
          features,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't save plan. Please try again.");
        return;
      }

      const saved: Plan = json.data.plan;
      setPlans((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      closePanel();
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const isEditingThis = selectedId === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-3xl border bg-white p-5 transition ${
                isEditingThis
                  ? "border-[#24402F] shadow-[0_20px_50px_rgba(23,37,28,0.08)]"
                  : "border-[#E4DCC8]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDF0E7] text-[#24402F]">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#17251C]">
                    {plan.name}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6B6558]">
                    ₦{plan.price.toLocaleString()} / {plan.frequency}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-xs text-[#6B6558]">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-[#F1EFE5] pt-4 text-sm">
                <button
                  type="button"
                  onClick={() => openEdit(plan)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-fit rounded-3xl border border-[#E4DCC8] bg-white p-6 lg:sticky lg:top-8">
        {selectedId ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#BC8A31]">
                  Edit
                </p>
                <h2 className="mt-1 font-display text-xl text-[#17251C]">
                  {plans.find((p) => p.id === selectedId)?.name}
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
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₦)">
                <input
                  required
                  type="number"
                  min={0}
                  step={500}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>
              <Field label="Frequency">
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      frequency: e.target.value as Plan["frequency"],
                    })
                  }
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#17251C]">
                Features
              </label>
              {form.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    disabled={form.features.length === 1}
                    aria-label="Remove feature"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6B6558] transition hover:bg-[#17251C]/[0.04] disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="mt-1 inline-flex items-center gap-1.5 self-start text-xs font-medium text-[#24402F] underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add feature
              </button>
            </div>

            {error && (
              <p className="rounded-xl border border-[#F3D4CF] bg-[#FBEAE7] px-3 py-2 text-sm text-[#B3261E]">
                {error}
              </p>
            )}

            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#24402F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
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
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="mt-1 text-sm font-medium text-[#17251C]">
              Nothing selected
            </p>
            <p className="max-w-[220px] text-sm text-[#6B6558]">
              Choose a plan to edit its price, frequency, or features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#17251C]">{label}</label>
      {children}
    </div>
  );
}
