import type { DeliveryStatus } from "../../api/lib/data-store";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  scheduled: "Scheduled",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  issue: "Issue",
  skipped: "Skipped",
};

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  scheduled: "border border-[#E6E3DA] bg-white text-[#706C60]",
  out_for_delivery: "bg-[var(--accent-soft)] text-[var(--accent)]",
  delivered: "bg-[#EDF0E7] text-[#2E3B29]",
  issue: "bg-[#FBEAE7] text-[#B3261E]",
  skipped: "bg-[#F1EFE9] text-[#6B6558]",
};

export function DeliveryStatusPill({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
