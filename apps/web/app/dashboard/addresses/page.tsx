"use client";

import { useEffect, useState } from "react";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  isDefault: boolean;
};

const emptyForm = { label: "", line1: "", line2: "", city: "", state: "" };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/addresses");
    const json = await res.json();
    if (json.success) setAddresses(json.data.addresses);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(editingId ? `/api/addresses/${editingId}` : "/api/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't save address. Please try again.");
        return;
      }
      cancelEdit();
      load();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setError(json.error ?? "Couldn't delete address.");
      return;
    }
    load();
  }

  async function makeDefault(id: string) {
    setError(null);
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
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">Addresses</p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Address book</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
          {loading ? (
            <p className="text-sm text-[#6B6558]">Loading…</p>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
              <p className="text-sm font-medium text-[#17251C]">No addresses yet</p>
              <p className="max-w-xs text-sm text-[#6B6558]">
                Add a delivery address so we know where to send your box.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E4DCC8]">
              {addresses.map((address) => (
                <div key={address.id} className="flex items-start justify-between gap-3 py-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-[#17251C]">
                      {address.label}
                      {address.isDefault && (
                        <span className="rounded-full bg-[#24402F]/10 px-2 py-0.5 text-[11px] font-medium text-[#24402F]">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-[#6B6558]">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 text-sm">
                    <button onClick={() => startEdit(address)} className="text-[#24402F] underline">
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button onClick={() => makeDefault(address.id)} className="text-[#6B6558] underline">
                        Make default
                      </button>
                    )}
                    <button onClick={() => handleDelete(address.id)} className="text-red-700 underline">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-3 rounded-3xl border border-[#E4DCC8] bg-white p-6"
        >
          <h2 className="font-display text-xl text-[#17251C]">
            {editingId ? "Edit address" : "Add a new address"}
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Label</label>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Home, Office…"
              className="rounded-md border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24402F]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Address line 1</label>
            <input
              required
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
              className="rounded-md border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24402F]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Address line 2 (optional)</label>
            <input
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
              className="rounded-md border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24402F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-md border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24402F]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">State</label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="rounded-md border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24402F]"
              />
            </div>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#24402F] px-5 py-2.5 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22] disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add address"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md border border-[#E4DCC8] px-5 py-2.5 text-sm font-medium text-[#17251C]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
