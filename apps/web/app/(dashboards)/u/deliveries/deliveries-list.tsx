"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeliveryStatusPill } from "./delivery-status-pill";
import type { DeliveryStatus } from "../../../api/lib/data-store";

type Delivery = {
  id: string;
  status: DeliveryStatus;
  scheduledDate: string;
  deliveredAt: string | null;
  address: {
    label: string;
    line1: string;
    city: string;
    state: string;
  } | null;
};

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
] as const;

export function DeliveriesList({
  upcoming,
  past,
}: {
  upcoming: Delivery[];
  past: Delivery[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>(
    upcoming.length > 0 ? "upcoming" : "past",
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = tab === "upcoming" ? upcoming : past;

  if (upcoming.length === 0 && past.length === 0) return null;

  async function handleSkip(deliveryId: string) {
    setBusyId(deliveryId);
    setError(null);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't skip this delivery.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const active = tab === item.key;
          const count = item.key === "upcoming" ? upcoming.length : past.length;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E3B29]/30 ${
                active
                  ? "bg-[#2E3B29] text-white"
                  : "border border-[#E4DCC8] text-[#6B6558] hover:bg-[#F1EFE9]"
              }`}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-4 py-3 text-sm text-[#B3261E]">
        {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
          <p className="text-sm font-medium text-[#17251C]">
            {tab === "upcoming"
              ? "Nothing else scheduled"
              : "No deliveries yet"}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[#E4DCC8]">
          {rows.map((delivery) => (
            <div
              key={delivery.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[#17251C]">
                  {new Date(delivery.scheduledDate).toLocaleDateString("en-NG", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-0.5 text-xs text-[#6B6558]">
                  {delivery.address
                    ? `${delivery.address.label} · ${delivery.address.city}, ${delivery.address.state}`
                    : "No address on file"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <DeliveryStatusPill status={delivery.status} />
                {tab === "upcoming" && delivery.status === "scheduled" && (
                  <button
                    type="button"
                    onClick={() => handleSkip(delivery.id)}
                    disabled={busyId === delivery.id}
                    className="rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs font-medium text-[#6B6558] transition hover:bg-[#17251C]/[0.04] disabled:opacity-60"
                  >
                    {busyId === delivery.id ? "Skipping…" : "Skip"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
