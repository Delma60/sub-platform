export function StatusBadge({ status }: { status: string }) {
  const POSITIVE = new Set([
    "active",
    "delivered",
    "success",
    "out_for_delivery",
    "processing",
    "packed",
    "scheduled",
  ]);
  const NEGATIVE = new Set(["cancelled", "failed", "issue"]);

  const LABELS: Record<string, string> = {
    out_for_delivery: "Out for delivery",
  };

  const style = POSITIVE.has(status)
    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
    : NEGATIVE.has(status)
      ? "bg-[#FDE8E6] text-[#B3261E]"
      : "border border-[color:var(--line)] text-[var(--ink-soft)]";

  const label = LABELS[status] ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
  );
}
