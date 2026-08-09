export function StatusBadge({ status }: { status: string }) {
  const STYLES: Record<string, string> = {
    active: "bg-[#24402F]/10 text-[#24402F]",
    paused: "bg-[#BC8A31]/10 text-[#BC8A31]",
    cancelled: "bg-red-50 text-red-700",
    processing: "bg-[#BC8A31]/10 text-[#BC8A31]",
    packed: "bg-[#17251C]/5 text-[#17251C]",
    out_for_delivery: "bg-[#24402F]/10 text-[#24402F]",
    delivered: "bg-[#24402F]/10 text-[#24402F]",
    scheduled: "bg-[#BC8A31]/10 text-[#BC8A31]",
    issue: "bg-red-50 text-red-700",
    success: "bg-[#24402F]/10 text-[#24402F]",
    failed: "bg-red-50 text-red-700",
    pending: "bg-[#BC8A31]/10 text-[#BC8A31]",
  };

  const LABELS: Record<string, string> = {
    out_for_delivery: "Out for delivery",
  };

  const style = STYLES[status] ?? "bg-[#17251C]/5 text-[#17251C]";
  const label = LABELS[status] ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
  );
}
