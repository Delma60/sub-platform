"use client";

import { useRouter } from "next/navigation";
import { DeliveryStatusActions } from "../delivery-status-actions";
import type { DeliveryStatus } from "../../../../api/lib/data-store";

export function DeliveryDetailActions({
  deliveryId,
  status,
}: {
  deliveryId: string;
  status: DeliveryStatus;
}) {
  const router = useRouter();

  return (
    <DeliveryStatusActions
      deliveryId={deliveryId}
      status={status}
      onUpdated={() => router.refresh()}
    />
  );
}
