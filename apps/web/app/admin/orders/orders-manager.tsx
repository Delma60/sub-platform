"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "../../dashboard/components/status-badge";

type OrderStatus = "processing" | "packed" | "out_for_delivery" | "delivered";

type Row = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  deliveryDate: string;
  planName: string;
  customerName: string;
  customerEmail: string;
};

const STEPS: OrderStatus[] = [
  "processing",
  "packed",
  "out_for_delivery",
  "delivered",
];

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = STEPS.indexOf(status);
  return index >= 0 && index < STEPS.length - 1 ? STEPS[index + 1] : null;
}

function prevStatus(status: OrderStatus): OrderStatus | null {
  const index = STEPS.indexOf(status);
  return index > 0 ? STEPS[index - 1] : null;
}

const STEP_LABELS: Record<OrderStatus, string> = {
  processing: "Processing",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export function OrdersManager({ initialOrders }: { initialOrders: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
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
            row.customerEmail.toLowerCase().includes(q) ||
            row.id.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [rows, filter, query]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      const updated = json.data.order;
      setRows((prev) =>
        prev.map((row) =>
          row.id === orderId ? { ...row, status: updated.status } : row,
        ),
      );
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
          <p className="text-sm font-medium text-[#17251C]">No orders yet</p>
          <p className="max-w-xs text-sm text-[#6B6558]">
            Orders show up here once customer subscriptions start generating
            them.
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
          placeholder="Search name, email, order ID…"
          className="w-full rounded-full border border-[#E4DCC8] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#24402F] sm:w-72"
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
          <p className="text-sm text-[#6B6558]">
            Try a different filter or search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[#E4DCC8]">
          {filtered.map((row) => {
            const isExpanded = expandedId === row.id;
            const isBusy = busyId === row.id;
            const next = nextStatus(row.status);
            const prev = prevStatus(row.status);

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
                      Order #{row.id.split("_")[1]} · {row.planName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="text-xs text-[#6B6558]">
                      {new Date(row.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-sm text-[#17251C]">
                      ₦{row.total.toLocaleString()}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#FAF6EF] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#6B6558]">
                      Delivery due{" "}
                      {new Date(row.deliveryDate).toLocaleDateString("en-NG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {prev && (
                        <button
                          type="button"
                          onClick={() => updateStatus(row.id, prev)}
                          disabled={isBusy}
                          className="rounded-full border border-[#E4DCC8] px-3.5 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-white disabled:opacity-60"
                        >
                          {isBusy
                            ? "Updating…"
                            : `Back to ${STEP_LABELS[prev]}`}
                        </button>
                      )}
                      {next && (
                        <button
                          type="button"
                          onClick={() => updateStatus(row.id, next)}
                          disabled={isBusy}
                          className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
                        >
                          {isBusy
                            ? "Updating…"
                            : `Advance to ${STEP_LABELS[next]}`}
                        </button>
                      )}
                      {!next && (
                        <span className="text-xs font-medium text-[#24402F]">
                          Fulfilled
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
