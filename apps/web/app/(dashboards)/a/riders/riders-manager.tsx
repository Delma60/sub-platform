"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Bike, Pencil, Plus, Search, ShieldCheck, X } from "lucide-react";

type Rider = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
};

type Filter = "all" | "active" | "inactive";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  active: true,
};

export function RidersManager({ initialRiders }: { initialRiders: Rider[] }) {
  const [riders, setRiders] = useState<Rider[]>(initialRiders);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedRider = selectedId
    ? riders.find((rider) => rider.id === selectedId) ?? null
    : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return riders
      .filter((rider) =>
        filter === "active"
          ? rider.active
          : filter === "inactive"
            ? !rider.active
            : true
      )
      .filter((rider) =>
        q
          ? rider.name.toLowerCase().includes(q) ||
            rider.email.toLowerCase().includes(q) ||
            (rider.phone ?? "").toLowerCase().includes(q)
          : true
      );
  }, [riders, filter, query]);

  function openCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function openEdit(rider: Rider) {
    setMode("edit");
    setSelectedId(rider.id);
    setForm({
      name: rider.name,
      email: rider.email,
      phone: rider.phone ?? "",
      password: "",
      active: rider.active,
    });
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      active: form.active,
    };

    if (mode === "edit" && !payload.password) {
      delete (payload as Partial<typeof payload>).password;
    }

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/riders" : `/api/admin/riders/${selectedId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not save rider. Please try again.");
        return;
      }

      const rider: Rider = json.data.rider;
      if (mode === "create") {
        setRiders((prev) => [rider, ...prev]);
        openCreate();
      } else {
        setRiders((prev) => prev.map((row) => (row.id === rider.id ? rider : row)));
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function setRiderActive(rider: Rider, active: boolean) {
    setBusyId(rider.id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/riders/${rider.id}`, {
        method: active ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: active ? JSON.stringify({ active: true }) : undefined,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not update rider. Please try again.");
        return;
      }

      const updated: Rider = json.data.rider;
      setRiders((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      if (selectedId === updated.id) {
        setForm((prev) => ({ ...prev, active: updated.active }));
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "inactive"] as Filter[]).map((item) => {
              const active = filter === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24402F]/30 ${
                    active
                      ? "bg-[#24402F] text-white"
                      : "border border-[#E4DCC8] text-[#6B6558] hover:bg-[#17251C]/[0.04]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6558]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search riders..."
                className="w-full rounded-full border border-[#E4DCC8] bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[#24402F] sm:w-64"
              />
            </label>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#24402F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a2f22]"
            >
              <Plus className="h-4 w-4" />
              New rider
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-4 py-3 text-sm text-[#B3261E]">
            {error}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
            <Bike className="h-7 w-7 text-[#24402F]" />
            <p className="text-sm font-medium text-[#17251C]">No riders found</p>
            <p className="max-w-xs text-sm text-[#6B6558]">
              Add riders here so they can sign in and access the `/r` dashboard.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#E4DCC8]">
            <div className="grid grid-cols-[1.4fr_1fr_120px_150px] gap-4 bg-[#FAF6EF] px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#6B6558] max-lg:hidden">
              <span>Rider</span>
              <span>Phone</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-[#E4DCC8]">
              {filtered.map((rider) => (
                <div
                  key={rider.id}
                  className="grid gap-3 px-4 py-4 lg:grid-cols-[1.4fr_1fr_120px_150px] lg:items-center lg:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#17251C]">
                      {rider.name}
                    </p>
                    <p className="truncate text-xs text-[#6B6558]">{rider.email}</p>
                  </div>

                  <p className="text-sm text-[#6B6558]">
                    {rider.phone || "No phone"}
                  </p>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      rider.active
                        ? "bg-[#EDF0E7] text-[#24402F]"
                        : "bg-[#FBEAE7] text-[#B3261E]"
                    }`}
                  >
                    {rider.active ? "Active" : "Inactive"}
                  </span>

                  <div className="flex items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => openEdit(rider)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setRiderActive(rider, !rider.active)}
                      disabled={busyId === rider.id}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                        rider.active
                          ? "text-[#B3261E] hover:bg-[#FBEAE7]"
                          : "text-[#24402F] hover:bg-[#EDF0E7]"
                      }`}
                    >
                      {busyId === rider.id
                        ? "Saving..."
                        : rider.active
                          ? "Deactivate"
                          : "Reactivate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-3xl border border-[#E4DCC8] bg-white p-6 xl:sticky xl:top-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#BC8A31]">
              {mode === "create" ? "Create" : "Edit"}
            </p>
            <h2 className="mt-1 font-display text-xl text-[#17251C]">
              {mode === "create" ? "New rider" : selectedRider?.name ?? "Rider"}
            </h2>
          </div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={openCreate}
              aria-label="Close edit mode"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6558] transition hover:bg-[#17251C]/[0.04] hover:text-[#17251C]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+2348012345678"
              className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
            />
          </Field>

          <Field label={mode === "create" ? "Password" : "New password"}>
            <input
              required={mode === "create"}
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
              className="rounded-xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
            />
          </Field>

          <label className="flex items-center justify-between rounded-2xl border border-[#E4DCC8] px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-[#17251C]">
              <ShieldCheck className="h-4 w-4 text-[#24402F]" />
              Active account
            </span>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-[#24402F]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-full bg-[#24402F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create rider"
              : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#17251C]">{label}</span>
      {children}
    </label>
  );
}
