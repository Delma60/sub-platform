"use client";

import { useState } from "react";
import { DeliveryStatusPill } from "./delivery-status-pill";
import type { DeliveryStatus } from "../../api/lib/data-store";

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
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>(
    upcoming.length > 0 ? "upcoming" : "past",
  );

  const rows = tab === "upcoming" ? upcoming : past;

  if (upcoming.length === 0 && past.length === 0) {
    return null;
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
                  {new Date(delivery.scheduledDate).toLocaleDateString(
                    "en-NG",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
                <p className="mt-0.5 text-xs text-[#6B6558]">
                  {delivery.address
                    ? `${delivery.address.label} · ${delivery.address.city}, ${delivery.address.state}`
                    : "No address on file"}
                </p>
              </div>

              <DeliveryStatusPill status={delivery.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
