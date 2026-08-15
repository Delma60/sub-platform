"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Phone, MapPin } from "lucide-react";
import { DeliveryStatusPill } from "../../u/deliveries/delivery-status-pill";
import { DeliveryStatusActions } from "./delivery-status-actions";
import type { DeliveryStatus } from "../../../api/lib/data-store";

type Row = {
  id: string;
  status: DeliveryStatus;
  scheduledDate: string;
  deliveredAt: string | null;
  orderId: string;
  planName: string;
  customerName: string;
  customerPhone: string | null;
  address: {
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
  } | null;
};

type RouteFilter = "all" | "today" | "pending" | "in_progress" | "completed" | "failed";

const FILTERS: { key: RouteFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

function directionsUrl(address: Row["address"]) {
  if (!address) return null;
  const query = [address.line1, address.line2, address.city, address.state]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function RiderDeliveriesList({
  initialDeliveries,
}: {
  initialDeliveries: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initialDeliveries);
  const [filter, setFilter] = useState<RouteFilter>("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (filter === "all") return true;
        if (filter === "today") {
          const date = new Date(row.scheduledDate);
          const today = new Date();
          return date.toDateString() === today.toDateString();
        }
        if (filter === "pending") return row.status === "scheduled";
        if (filter === "in_progress") return row.status === "out_for_delivery";
        if (filter === "completed") return row.status === "delivered";
        return row.status === "issue";
      })
      .filter((row) => (q ? row.customerName.toLowerCase().includes(q) : true));
  }, [rows, filter, query]);

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
          <p className="text-sm font-medium text-[#17251C]">No deliveries here</p>
          <p className="max-w-xs text-sm text-[#6B6558]">
            Deliveries will show up once orders are generated from customer
            subscriptions.
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
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
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
          placeholder="Search customer name…"
          className="w-full rounded-full border border-[#E4DCC8] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#24402F] sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
          <p className="text-sm font-medium text-[#17251C]">No matches</p>
          <p className="text-sm text-[#6B6558]">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[#E4DCC8]">
          {filtered.map((row) => {
            const isExpanded = expandedId === row.id;
            const maps = directionsUrl(row.address);

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
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#FAF6EF] p-4">
                    <div className="flex flex-col gap-2 text-sm text-[#6B6558] sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        {row.address
                          ? `${row.address.label} · ${row.address.line1}${
                              row.address.line2 ? `, ${row.address.line2}` : ""
                            }, ${row.address.city}, ${row.address.state}`
                          : "No address on file"}
                      </p>
                      <div className="flex shrink-0 items-center gap-3">
                        {row.customerPhone && (
                          <a
                            href={`tel:${row.customerPhone}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#24402F] underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </a>
                        )}
                        {maps && (
                          <a
                            href={maps}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#24402F] underline"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Directions
                          </a>
                        )}
                      </div>
                    </div>

                    <DeliveryStatusActions
                      deliveryId={row.id}
                      status={row.status}
                      onUpdated={(updated) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, status: updated.status, deliveredAt: updated.deliveredAt }
                              : item,
                          ),
                        )
                      }
                    />

                    <Link
                      href={`/r/deliveries/${row.id}`}
                      className="self-start text-xs font-medium text-[#24402F] underline"
                    >
                      Open full details →
                    </Link>
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
