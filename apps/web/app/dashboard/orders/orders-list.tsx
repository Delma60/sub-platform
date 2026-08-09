"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "../components/status-badge";
import type { OrderStatus } from "../../api/lib/data-store";

type Order = {
  id: string;
  planName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  deliveryDate: string;
};

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export function OrdersList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter],
  );

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
          <p className="text-sm font-medium text-[#17251C]">No orders yet</p>
          <p className="max-w-xs text-sm text-[#6B6558]">
            Orders are generated automatically from your subscription once it's
            active.
          </p>
          <Link
            href="/dashboard/subscription"
            className="mt-2 text-sm font-medium text-[#24402F] underline"
          >
            Choose a plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24402F]/30 ${
                active
                  ? "bg-[#24402F] text-[#FAF6EF]"
                  : "border border-[#E4DCC8] text-[#6B6558] hover:bg-[#17251C]/[0.04]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
          <p className="text-sm font-medium text-[#17251C]">
            No orders in this status
          </p>
          <p className="text-sm text-[#6B6558]">
            Try a different filter above.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[#E4DCC8]">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="flex flex-col gap-4 border-b border-[#E4DCC8] py-5 last:border-none last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#17251C]">
            Order #{order.id.split("_")[1]} · {order.planName}
          </p>
          <p className="mt-1 text-xs text-[#6B6558]">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })}{" "}
            · Delivery{" "}
            {new Date(order.deliveryDate).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#17251C]">
            ₦{order.total.toLocaleString()}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <Stepper currentIndex={currentIndex} />
    </div>
  );
}

function Stepper({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <div
            key={step.key}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`h-2.5 w-2.5 rounded-full transition ${
                  done ? "bg-[#24402F]" : "bg-[#E4DCC8]"
                }`}
              />
              <span
                className={`hidden text-[10px] uppercase tracking-[0.06em] sm:block ${
                  done ? "text-[#17251C]" : "text-[#6B6558]/70"
                }`}
                style={{ width: 74 }}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <span
                className={`h-px flex-1 transition ${
                  index < currentIndex ? "bg-[#24402F]" : "bg-[#E4DCC8]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
