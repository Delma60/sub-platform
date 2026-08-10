"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "../../u/components/status-badge";

type SubscriptionStatus = "active" | "paused" | "cancelled" | "payment_failed";
type PlanId = "single" | "family" | "bulk";

type Row = {
  id: string;
  status: SubscriptionStatus;
  planId: PlanId;
  planName: string;
  planPrice: number;
  planFrequency: string;
  nextDeliveryDate: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
};

const FILTERS: { key: SubscriptionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "payment_failed", label: "Payment failed" },
  { key: "cancelled", label: "Cancelled" },
];

export function SubscriptionsManager({
  initialSubscriptions,
  plans,
}: {
  initialSubscriptions: Row[];
  plans: { id: PlanId; name: string }[];
}) {
  const [rows, setRows] = useState<Row[]>(initialSubscriptions);
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!q) return true;
      return (
        row.customerName.toLowerCase().includes(q) ||
        row.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  async function runAction(
    subscriptionId: string,
    action: "pause" | "resume" | "cancel" | "change_plan",
    planId?: PlanId,
  ) {
    setBusyId(subscriptionId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          planId ? { action: "change_plan", planId } : { action },
        ),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      const updated = json.data.subscription;
      setRows((prev) =>
        prev.map((row) =>
          row.id === subscriptionId
            ? {
                ...row,
                status: updated.status,
                planId: updated.planId,
                planName:
                  plans.find((p) => p.id === updated.planId)?.name ??
                  row.planName,
                nextDeliveryDate: updated.nextDeliveryDate,
              }
            : row,
        ),
      );
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusyId(null);
      setConfirmingCancel(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
          <p className="text-sm font-medium text-[#17251C]">
            No subscriptions yet
          </p>
          <p className="max-w-xs text-sm text-[#6B6558]">
            Subscriptions will show up here once customers start subscribing.
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
          <p className="text-sm text-[#6B6558]">
            Try a different filter or search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[#E4DCC8]">
          {filtered.map((row) => {
            const isExpanded = expandedId === row.id;
            const isBusy = busyId === row.id;
            const isConfirmingCancel = confirmingCancel === row.id;

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
                      {row.customerEmail}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="text-sm text-[#17251C]">
                      {row.planName} · ₦{row.planPrice.toLocaleString()}/
                      {row.planFrequency}
                    </span>
                    <span className="text-xs text-[#6B6558]">
                      Next{" "}
                      {new Date(row.nextDeliveryDate).toLocaleDateString(
                        "en-NG",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#FAF6EF] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#6B6558]">
                        Plan
                      </label>
                      <select
                        value={row.planId}
                        disabled={isBusy || row.status === "cancelled"}
                        onChange={(e) =>
                          runAction(
                            row.id,
                            "change_plan",
                            e.target.value as PlanId,
                          )
                        }
                        className="rounded-full border border-[#E4DCC8] bg-white px-3 py-1.5 text-xs font-medium text-[#17251C] outline-none transition focus:border-[#24402F] disabled:opacity-60"
                      >
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {row.status === "active" && (
                        <button
                          type="button"
                          onClick={() => runAction(row.id, "pause")}
                          disabled={isBusy}
                          className="rounded-full border border-[#E4DCC8] px-3.5 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-white disabled:opacity-60"
                        >
                          {isBusy ? "Pausing…" : "Pause"}
                        </button>
                      )}
                      {row.status === "paused" && (
                        <button
                          type="button"
                          onClick={() => runAction(row.id, "resume")}
                          disabled={isBusy}
                          className="rounded-full border border-[#E4DCC8] px-3.5 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-white disabled:opacity-60"
                        >
                          {isBusy ? "Resuming…" : "Resume"}
                        </button>
                      )}

                      {row.status !== "cancelled" &&
                        (isConfirmingCancel ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#6B6558]">
                              Cancel this?
                            </span>
                            <button
                              type="button"
                              onClick={() => runAction(row.id, "cancel")}
                              disabled={isBusy}
                              className="rounded-full bg-[#B3261E] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#96201A] disabled:opacity-60"
                            >
                              {isBusy ? "Cancelling…" : "Confirm cancel"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingCancel(null)}
                              className="text-xs font-medium text-[#6B6558] underline"
                            >
                              Back
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingCancel(row.id)}
                            disabled={isBusy}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#B3261E] transition hover:bg-[#FBEAE7] disabled:opacity-60"
                          >
                            Cancel subscription
                          </button>
                        ))}
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
