"use client";

import { useMemo, useState } from "react";
import { DeliveryStatusPill } from "../../dashboard/deliveries/delivery-status-pill";

type DeliveryStatus = "scheduled" | "out_for_delivery" | "delivered" | "issue" | "skipped";

type Row = {
  id: string;
  status: DeliveryStatus;
  scheduledDate: string;
  deliveredAt: string | null;
  orderId: string;
  planName: string;
  customerName: string;
  customerEmail: string;
  address: { label: string; line1: string; city: string; state: string } | null;
};

const FILTERS: { key: DeliveryStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "issue", label: "Issues" },
  { key: "delivered", label: "Delivered" },
];

export function DeliveriesManager({ initialDeliveries }: { initialDeliveries: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialDeliveries);
  const [filter, setFilter] = useState<DeliveryStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => (filter === "all" ? true : row.status === filter))
      .filter((row) =>
        q
          ? row.customerName.toLowerCase().includes(q) ||
            row.customerEmail.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => (a.scheduledDate < b.scheduledDate ? -1 : 1));
  }, [rows, filter, query]);

  async function runAction(deliveryId: string, status: DeliveryStatus) {
    setBusyId(deliveryId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      const updated = json.data.delivery;
      setRows((prev) =>
        prev.map((row) =>
          row.id === deliveryId
            ? { ...row, status: updated.status, deliveredAt: updated.deliveredAt }
            : row,
        ),
      );
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
          <p className="text-sm font-medium text-[#17251C]">No deliveries yet</p>
          <p className="max-w-xs text-sm text-[#6B6558]">
            Deliveries appear here once orders start generating from customer subscriptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24402F]/30 ${
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

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email…"
          className="w-full rounded-full border border-[#E4DCC8] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#24402F] sm:w-64"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-4 py-3 text-sm text-[#B3261E]">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
          <p className="text-sm font-medium text-[#17251C]">No matches</p>
          <p className="text-sm text-[#6B6558]">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[#E4DCC8]">
          {filtered.map((row) => {
            const isExpanded = expandedId === row.id;
            const isBusy = busyId === row.id;

            return (
              <div key={row.id} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : row.id)}
                  className="flex w-full flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#17251C]">
                      {row.customerName}
                    </p>
                    <p className="truncate text-xs text-[#6B6558]">
                      Order #{row.orderId.split("_")[1]} · {row.planName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="text-xs text-[#6B6558]">
                      {new Date(row.scheduledDate).toLocaleDateString("en-NG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <DeliveryStatusPill status={row.status} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#FAF6EF] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#6B6558]">
                      {row.address
                        ? `${row.address.label} · ${row.address.line1}, ${row.address.city}, ${row.address.state}`
                        : "No address on file"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {row.status === "scheduled" && (
                        <>
                          <button
                            type="button"
                            onClick={() => runAction(row.id, "out_for_delivery")}
                            disabled={isBusy}
                            className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
                          >
                            {isBusy ? "Updating…" : "Mark out for delivery"}
                          </button>
                          <button
                            type="button"
                            onClick={() => runAction(row.id, "issue")}
                            disabled={isBusy}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#B3261E] transition hover:bg-[#FBEAE7] disabled:opacity-60"
                          >
                            Report issue
                          </button>
                        </>
                      )}

                      {row.status === "out_for_delivery" && (
                        <>
                          <button
                            type="button"
                            onClick={() => runAction(row.id, "delivered")}
                            disabled={isBusy}
                            className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
                          >
                            {isBusy ? "Updating…" : "Mark delivered"}
                          </button>
                          <button
                            type="button"
                            onClick={() => runAction(row.id, "issue")}
                            disabled={isBusy}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#B3261E] transition hover:bg-[#FBEAE7] disabled:opacity-60"
                          >
                            Report issue
                          </button>
                        </>
                      )}

                      {row.status === "issue" && (
                        <>
                          <button
                            type="button"
                            onClick={() => runAction(row.id, "delivered")}
                            disabled={isBusy}
                            className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
                          >
                            {isBusy ? "Updating…" : "Mark delivered"}
                          </button>
                          <button
                            type="button"
                            onClick={() => runAction(row.id, "scheduled")}
                            disabled={isBusy}
                            className="rounded-full border border-[#E4DCC8] px-3.5 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-white disabled:opacity-60"
                          >
                            {isBusy ? "Updating…" : "Revert to scheduled"}
                          </button>
                        </>
                      )}

                      {(row.status === "delivered" || row.status === "skipped") && (
                        <span className="text-xs text-[#6B6558]">
                          {row.status === "delivered" && row.deliveredAt
                            ? `Delivered ${new Date(row.deliveredAt).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                              })}`
                            : "Skipped by customer"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
