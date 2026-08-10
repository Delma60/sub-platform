"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  isDefault: boolean;
};

type PanelState =
  | { mode: "idle" }
  | { mode: "add" }
  | { mode: "edit"; address: Address };

const emptyForm = { label: "", line1: "", line2: "", city: "", state: "" };

export function AddressBook({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [form, setForm] = useState(emptyForm);
  const [panel, setPanel] = useState<PanelState>({ mode: "idle" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openAdd() {
    setForm(emptyForm);
    setError(null);
    setPanel({ mode: "add" });
  }

  function openEdit(address: Address) {
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
    });
    setError(null);
    setPanel({ mode: "edit", address });
  }

  function closePanel() {
    setForm(emptyForm);
    setError(null);
    setPanel({ mode: "idle" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const editingId = panel.mode === "edit" ? panel.address.id : null;

    try {
      const res = await fetch(
        editingId ? `/api/addresses/${editingId}` : "/api/addresses",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't save address. Please try again.");
        return;
      }

      const saved: Address = json.data.address;
      setAddresses((prev) => {
        if (editingId) {
          const updated = prev.map((address) =>
            address.id === editingId ? saved : address,
          );
          return saved.isDefault
            ? updated.map((address) =>
                address.id === saved.id
                  ? address
                  : { ...address, isDefault: false },
              )
            : updated;
        }

        const updated = saved.isDefault
          ? prev.map((address) => ({ ...address, isDefault: false }))
          : prev;
        return [...updated, saved];
      });

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
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't delete address.");
        return;
      }

      setAddresses((prev) => {
        const remaining = prev.filter((address) => address.id !== id);
        const removed = prev.find((address) => address.id === id);

        if (
          removed?.isDefault &&
          remaining.length > 0 &&
          !remaining.some((address) => address.isDefault)
        ) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }

        return remaining;
      });

      if (panel.mode === "edit" && panel.address.id === id) {
        closePanel();
      }
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
      setConfirmingDelete(null);
    }
  }

  async function makeDefault(id: string) {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't update address.");
        return;
      }
      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          isDefault: address.id === id,
        })),
      );
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const isFormOpen = panel.mode !== "idle";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Addresses
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Address book
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Deliveries go to your default address unless an order says
          otherwise.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        <div className="flex flex-col gap-3">
          {error && (
            <p className="rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-4 py-3 text-sm text-[#B3261E]">
              {error}
            </p>
          )}

          {addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-[#E4DCC8] bg-white py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF0E7] text-[#24402F]">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="mt-2 text-sm font-medium text-[#17251C]">
                No addresses yet
              </p>
              <p className="max-w-xs text-sm text-[#6B6558]">
                Add a delivery address so we know where to send your box.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#24402F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a2f22]"
              >
                <Plus className="h-4 w-4" />
                Add your first address
              </button>
            </div>
          ) : (
            addresses.map((address) => {
              const isConfirming = confirmingDelete === address.id;
              const isBusy = busyId === address.id;
              const isEditingThis =
                panel.mode === "edit" && panel.address.id === address.id;

              return (
                <div
                  key={address.id}
                  className={`rounded-3xl border bg-white p-5 transition ${
                    isEditingThis
                      ? "border-[#24402F] shadow-[0_20px_50px_rgba(23,37,28,0.08)]"
                      : "border-[#E4DCC8]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          address.isDefault
                            ? "bg-[#BC8A31]/15 text-[#BC8A31]"
                            : "bg-[#EDF0E7] text-[#24402F]"
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-[#17251C]">
                          {address.label}
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#BC8A31]/12 px-2 py-0.5 text-[11px] font-medium text-[#BC8A31]">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              Default
                            </span>
                          )}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#6B6558]">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""},{" "}
                          {address.city}, {address.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-[#F1EFE5] pt-4 text-sm">
                    {isConfirming ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#6B6558]">
                          Delete this address?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(address.id)}
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
                          onClick={() => openEdit(address)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() => makeDefault(address.id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#6B6558] transition hover:bg-[#17251C]/[0.04] disabled:opacity-60"
                          >
                            <Star className="h-3.5 w-3.5" />
                            {isBusy ? "Updating…" : "Make default"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(address.id)}
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

          {addresses.length > 0 && !isFormOpen && (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center justify-center gap-1.5 rounded-3xl border border-dashed border-[#E4DCC8] bg-white py-4 text-sm font-medium text-[#6B6558] transition hover:border-[#24402F] hover:text-[#24402F]"
            >
              <Plus className="h-4 w-4" />
              Add a new address
            </button>
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
                      ? "Edit address"
                      : "Add a new address"}
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

              <Field label="Label">
                <input
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home, Office…"
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>

              <Field label="Address line 1">
                <input
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>

              <Field label="Address line 2 (optional)">
                <input
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                  />
                </Field>
                <Field label="State">
                  <input
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
                  />
                </Field>
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
                  {saving
                    ? "Saving…"
                    : panel.mode === "edit"
                      ? "Save changes"
                      : "Add address"}
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
                <MapPin className="h-5 w-5" />
              </div>
              <p className="mt-1 text-sm font-medium text-[#17251C]">
                Nothing selected
              </p>
              <p className="max-w-[220px] text-sm text-[#6B6558]">
                Choose an address to edit, or add a new one.
              </p>
            </div>
          )}
        </div>
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