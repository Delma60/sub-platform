"use client";

import { useState } from "react";

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

export default function AddressesPage({
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
        <p className="text-xs uppercase tracking-[0.2em] text-[#706C60]">
          Addresses
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.015em] text-[#15150F]">
          Address book
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#706C60]">
          Deliveries go to your default address unless an order says otherwise.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
        <div className="flex flex-col gap-3">
          {error && (
            <p className="rounded-md border border-[#F3D4CF] bg-[#FBEAE7] px-3.5 py-2.5 text-sm text-[#B3261E]">
              {error}
            </p>
          )}

          {addresses?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#E6E3DA] bg-white py-16 text-center">
              <p className="text-sm font-medium text-[#15150F]">
                No addresses yet
              </p>
              <p className="max-w-xs text-sm text-[#706C60]">
                Add a delivery address so we know where to send your box.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="mt-2 text-sm font-medium text-[#2E3B29] underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            addresses?.map((address) => {
              const isConfirming = confirmingDelete === address.id;
              const isBusy = busyId === address.id;
              return (
                <div
                  key={address.id}
                  className={`rounded-lg border bg-white p-5 transition ${
                    panel.mode === "edit" && panel.address.id === address.id
                      ? "border-[#2E3B29]"
                      : "border-[#E6E3DA]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-[#15150F]">
                        {address.label}
                        {address.isDefault && (
                          <span className="rounded-full bg-[#EDF0E7] px-2 py-0.5 text-[11px] font-medium text-[#2E3B29]">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-sm text-[#706C60]">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""},{" "}
                        {address.city}, {address.state}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    {isConfirming ? (
                      <>
                        <span className="text-[#706C60]">
                          Delete this address?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(address.id)}
                          disabled={isBusy}
                          className="font-medium text-[#B3261E] underline disabled:opacity-60"
                        >
                          {isBusy ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(null)}
                          className="text-[#706C60] underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(address)}
                          className="font-medium text-[#15150F] underline decoration-[#E6E3DA] underline-offset-2 hover:decoration-[#15150F]"
                        >
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() => makeDefault(address.id)}
                            disabled={isBusy}
                            className="text-[#706C60] underline decoration-[#E6E3DA] underline-offset-2 hover:decoration-[#706C60] disabled:opacity-60"
                          >
                            {isBusy ? "Updating…" : "Make default"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(address.id)}
                          className="text-[#B3261E] underline decoration-[#F3D4CF] underline-offset-2 hover:decoration-[#B3261E]"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {addresses?.length > 0 && !isFormOpen && (
            <button
              type="button"
              onClick={openAdd}
              className="rounded-lg border border-dashed border-[#E6E3DA] bg-white py-4 text-sm font-medium text-[#706C60] transition hover:border-[#2E3B29] hover:text-[#2E3B29]"
            >
              + Add a new address
            </button>
          )}
        </div>

        <div className="h-fit rounded-lg border border-[#E6E3DA] bg-white p-6 lg:sticky lg:top-8">
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#15150F]">
                  {panel.mode === "edit" ? "Edit address" : "Add a new address"}
                </h2>
                <button
                  type="button"
                  onClick={closePanel}
                  className="text-[#706C60] hover:text-[#15150F]"
                >
                  ✕
                </button>
              </div>

              <Field label="Label">
                <input
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home, Office…"
                  className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
                />
              </Field>

              <Field label="Address line 1">
                <input
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
                />
              </Field>

              <Field label="Address line 2 (optional)">
                <input
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
                  />
                </Field>
                <Field label="State">
                  <input
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
                  />
                </Field>
              </div>

              {error && (
                <p className="rounded-md border border-[#F3D4CF] bg-[#FBEAE7] px-3 py-2 text-sm text-[#B3261E]">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-[#2E3B29] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#243020] disabled:opacity-60"
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
                  className="rounded-md border border-[#E6E3DA] px-5 py-2.5 text-sm font-medium text-[#15150F] hover:bg-[#F1EFE9]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-sm font-medium text-[#15150F]">
                Nothing selected
              </p>
              <p className="text-sm text-[#706C60]">
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
      <label className="text-sm font-medium text-[#15150F]">{label}</label>
      {children}
    </div>
  );
}
