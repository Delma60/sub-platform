"use client";

import { useState } from "react";
import type { DeliveryStatus } from "../../../api/lib/data-store";

type UpdatedDelivery = { status: DeliveryStatus; deliveredAt: string | null };

export function DeliveryStatusActions({ deliveryId, status, onUpdated }: { deliveryId: string; status: DeliveryStatus; onUpdated: (delivery: UpdatedDelivery) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startDelivery() {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/rider/deliveries/${deliveryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "out_for_delivery" }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error ?? "Could not start delivery");
      onUpdated(json.data.delivery);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start delivery"); }
    finally { setBusy(false); }
  }

  if (status !== "scheduled") return <p className="text-xs text-[#6B6558]">Open full details to complete, report an issue, or reschedule.</p>;
  return <div className="flex flex-col gap-2"><button type="button" onClick={() => void startDelivery()} disabled={busy} className="min-h-11 rounded-xl bg-[#24402F] px-4 py-2.5 text-xs font-medium text-white disabled:opacity-60">{busy ? "Starting…" : "Start delivery"}</button>{error && <p className="rounded-xl bg-[#FBEAE7] p-3 text-xs text-[#B3261E]">{error}</p>}</div>;
}