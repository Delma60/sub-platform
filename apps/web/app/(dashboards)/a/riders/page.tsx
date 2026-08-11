import { listUsers } from "../../../api/lib/store";
import { RidersManager } from "./riders-manager";

export default async function AdminRidersPage() {
  const riders = await listUsers("rider");
  const activeCount = riders.filter((rider) => rider.active).length;
  const inactiveCount = riders.length - activeCount;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Operations
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Riders</h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Create rider accounts, update contact details, and control who can
          access the rider dashboard.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Total riders" value={String(riders.length)} />
        <StatCard label="Active" value={String(activeCount)} />
        <StatCard
          label="Inactive"
          value={String(inactiveCount)}
          tone={inactiveCount > 0 ? "warning" : "neutral"}
        />
      </div>

      <RidersManager
        initialRiders={riders.map((rider) => ({
          id: rider.id,
          name: rider.name,
          email: rider.email,
          phone: rider.phone ?? null,
          active: rider.active,
          createdAt: rider.createdAt,
        }))}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warning";
}) {
  const valueColor = tone === "warning" ? "text-[#B3261E]" : "text-[#17251C]";
  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
