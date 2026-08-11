"use client";

import { useState } from "react";
import type { DeliveryStatus } from "../../../api/lib/data-store";

type UpdatedDelivery = { status: DeliveryStatus; deliveredAt: string | null };

export function DeliveryStatusActions({
  deliveryId,
  status,
  onUpdated,
}: {
  deliveryId: string;
  status: DeliveryStatus;
  onUpdated: (delivery: UpdatedDelivery) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: DeliveryStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/rider/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      onUpdated(json.data.delivery);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {status === "scheduled" && (
          <>
            <button
              type="button"
              onClick={() => updateStatus("out_for_delivery")}
              disabled={busy}
              className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
            >
              {busy ? "Updating…" : "Mark out for delivery"}
            </button>
            <button
              type="button"
              onClick={() => updateStatus("issue")}
              disabled={busy}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#B3261E] transition hover:bg-[#FBEAE7] disabled:opacity-60"
            >
              Report issue
            </button>
          </>
        )}

        {status === "out_for_delivery" && (
          <>
            <button
              type="button"
              onClick={() => updateStatus("delivered")}
              disabled={busy}
              className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
            >
              {busy ? "Updating…" : "Mark delivered"}
            </button>
            <button
              type="button"
              onClick={() => updateStatus("issue")}
              disabled={busy}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#B3261E] transition hover:bg-[#FBEAE7] disabled:opacity-60"
            >
              Report issue
            </button>
          </>
        )}

        {status === "issue" && (
          <>
            <button
              type="button"
              onClick={() => updateStatus("delivered")}
              disabled={busy}
              className="rounded-full bg-[#24402F] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#1a2f22] disabled:opacity-60"
            >
              {busy ? "Updating…" : "Mark delivered"}
            </button>
            <button
              type="button"
              onClick={() => updateStatus("scheduled")}
              disabled={busy}
              className="rounded-full border border-[#E4DCC8] px-3.5 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-white disabled:opacity-60"
            >
              {busy ? "Updating…" : "Revert to scheduled"}
            </button>
          </>
        )}

        {(status === "delivered" || status === "skipped") && (
          <span className="text-xs font-medium text-[#24402F]">
            {status === "delivered" ? "Delivered" : "Skipped by customer"}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-[#F3D4CF] bg-[#FBEAE7] px-3 py-2 text-xs text-[#B3261E]">
          {error}
        </p>
      )}
    </div>
  );
}
