import { listAllSubscriptions, listPlans } from "../../api/lib/data-store";
import { listUsersByIds } from "../../api/lib/store";
import { SubscriptionsManager } from "./subscriptions-manager";

export default async function AdminSubscriptionsPage() {
  const [subscriptions, plans] = await Promise.all([
    listAllSubscriptions(),
    listPlans(),
  ]);

  const usersById = await listUsersByIds(subscriptions.map((s) => s.userId));
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  const enriched = subscriptions.map((sub) => {
    const user = usersById.get(sub.userId);
    const plan = planMap.get(sub.planId);
    return {
      id: sub.id,
      status: sub.status,
      planId: sub.planId,
      planName: plan?.name ?? sub.planId,
      planPrice: plan?.price ?? 0,
      planFrequency: plan?.frequency ?? "monthly",
      nextDeliveryDate: sub.nextDeliveryDate,
      createdAt: sub.createdAt,
      customerName: user?.name ?? "Unknown customer",
      customerEmail: user?.email ?? "",
    };
  });

  const counts = {
    active: enriched.filter((s) => s.status === "active").length,
    paused: enriched.filter((s) => s.status === "paused").length,
    cancelled: enriched.filter((s) => s.status === "cancelled").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Operations
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Subscriptions
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Review every customer&apos;s subscription, switch their plan, or pause and
          cancel on their behalf.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Active" value={String(counts.active)} />
        <StatCard label="Paused" value={String(counts.paused)} />
        <StatCard label="Cancelled" value={String(counts.cancelled)} />
      </div>

      <SubscriptionsManager
        initialSubscriptions={enriched}
        plans={plans.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[#17251C]">{value}</p>
    </div>
  );
}
