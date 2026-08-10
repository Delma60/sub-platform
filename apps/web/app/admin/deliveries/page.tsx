import {
  listAllDeliveries,
  listAllOrders,
  listAllAddresses,
  listPlans,
} from "../../api/lib/data-store";
import { listUsersByIds } from "../../api/lib/store";
import { DeliveriesManager } from "./deliveries-manager";

export default async function AdminDeliveriesPage() {
  const [deliveries, orders, addresses, plans] = await Promise.all([
    listAllDeliveries(),
    listAllOrders(),
    listAllAddresses(),
    listPlans(),
  ]);

  const usersById = await listUsersByIds(deliveries.map((d) => d.userId));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const addressMap = new Map(addresses.map((a) => [a.id, a]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  const enriched = deliveries.map((delivery) => {
    const user = usersById.get(delivery.userId);
    const order = orderMap.get(delivery.orderId);
    const plan = order ? planMap.get(order.planId) : null;
    const address = delivery.addressId ? addressMap.get(delivery.addressId) : null;

    return {
      id: delivery.id,
      status: delivery.status,
      scheduledDate: delivery.scheduledDate,
      deliveredAt: delivery.deliveredAt,
      orderId: delivery.orderId,
      planName: plan?.name ?? "Plan",
      customerName: user?.name ?? "Unknown customer",
      customerEmail: user?.email ?? "",
      address: address
        ? {
            label: address.label,
            line1: address.line1,
            city: address.city,
            state: address.state,
          }
        : null,
    };
  });

  const today = new Date();
  const isToday = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const counts = {
    today: enriched.filter(
      (d) => isToday(d.scheduledDate) && d.status !== "delivered" && d.status !== "skipped",
    ).length,
    outForDelivery: enriched.filter((d) => d.status === "out_for_delivery").length,
    issues: enriched.filter((d) => d.status === "issue").length,
    delivered: enriched.filter((d) => d.status === "delivered").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Operations
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Deliveries
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Track today's route, move deliveries through their stages, and flag
          issues that need follow-up.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Due today" value={String(counts.today)} />
        <StatCard label="Out for delivery" value={String(counts.outForDelivery)} />
        <StatCard
          label="Issues"
          value={String(counts.issues)}
          tone={counts.issues > 0 ? "warning" : "neutral"}
        />
        <StatCard label="Delivered" value={String(counts.delivered)} />
      </div>

      <DeliveriesManager initialDeliveries={enriched} />
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
