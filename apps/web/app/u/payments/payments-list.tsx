"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "../components/status-badge";
import type { PaymentStatus } from "../../api/lib/data-store";

type Payment = {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  createdAt: string;
  planName: string | null;
};

const FILTERS: { key: PaymentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
];

export function PaymentsList({ payments }: { payments: Payment[] }) {
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? payments
        : payments.filter((payment) => payment.status === filter),
    [payments, filter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Payment[]>();
    for (const payment of filtered) {
      const label = new Date(payment.createdAt).toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      });
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(payment);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-[#E6E3DA] bg-white p-6">
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-[#E6E3DA] py-14 text-center">
          <p className="text-sm font-medium text-[#15150F]">No payments yet</p>
          <p className="max-w-xs text-sm text-[#706C60]">
            Your receipts will show up here once your first order is billed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E6E3DA] bg-white p-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filterOption) => {
          const active = filter === filterOption.key;
          return (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E3B29]/30 ${
                active
                  ? "bg-[#2E3B29] text-white"
                  : "border border-[#E6E3DA] text-[#706C60] hover:bg-[#F1EFE9]"
              }`}
            >
              {filterOption.label}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-1 rounded-md border border-dashed border-[#E6E3DA] py-10 text-center">
          <p className="text-sm font-medium text-[#15150F]">
            No payments in this status
          </p>
          <p className="text-sm text-[#706C60]">
            Try a different filter above.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-7">
          {groups.map(([month, rows]) => (
            <div key={month}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#706C60]/70">
                {month}
              </p>
              <div className="mt-2 flex flex-col divide-y divide-[#E6E3DA]">
                {rows.map((payment) => (
                  <PaymentRow key={payment.id} payment={payment} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1EFE9] text-[#15150F]">
            <CardIcon />
          </span>
          <div>
            <p className="text-sm font-medium text-[#15150F]">
              {payment.planName ? `${payment.planName} plan` : "Payment"} ·
              Order #{payment.orderId.split("_")[1]}
            </p>
            <p className="mt-0.5 text-xs text-[#706C60]">
              {payment.method} ·{" "}
              {new Date(payment.createdAt).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#15150F]">
            ₦{payment.amount.toLocaleString()}
          </span>
          <StatusBadge status={payment.status} />
        </div>
      </div>

      {payment.status === "failed" && (
        <div className="ml-12 flex items-center justify-between gap-3 rounded-md border border-[#F3D4CF] bg-[#FBEAE7] px-3.5 py-2.5">
          <p className="text-xs text-[#8A3B34]">
            This charge didn&apos;t go through. Your subscription is unaffected until
            you retry.
          </p>
          <Link
            href="/u/subscription"
            className="shrink-0 text-xs font-medium text-[#B3261E] underline"
          >
            Manage billing
          </Link>
        </div>
      )}

      {payment.status === "pending" && (
        <p className="ml-12 text-xs text-[#706C60]">
          Still confirming with your bank — this usually clears within a few
          minutes.
        </p>
      )}
    </div>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
      <rect
        x="2.5"
        y="4.5"
        width="15"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M2.5 8h15" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 12h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
