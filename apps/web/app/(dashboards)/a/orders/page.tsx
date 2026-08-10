import { listAllOrders, listPlans } from "../../../api/lib/data-store";
import { listUsersByIds } from "../../../api/lib/store";
import { OrdersManager } from "./orders-manager";

export default async function AdminOrdersPage() {
  const [orders, plans] = await Promise.all([listAllOrders(), listPlans()]);

  const usersById = await listUsersByIds(orders.map((o) => o.userId));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  const enriched = orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    deliveryDate: order.deliveryDate,
    planName: planMap.get(order.planId)?.name ?? order.planId,
    customerName: usersById.get(order.userId)?.name ?? "Unknown customer",
    customerEmail: usersById.get(order.userId)?.email ?? "",
  }));

  const now = new Date();
  const ordersThisMonth = enriched.filter((o) => {
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const counts = {
    processing: enriched.filter((o) => o.status === "processing").length,
    packed: enriched.filter((o) => o.status === "packed").length,
    outForDelivery: enriched.filter((o) => o.status === "out_for_delivery")
      .length,
    delivered: enriched.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Operations
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Orders</h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Track every order generated from customer subscriptions and move them
          through fulfillment.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month" value={String(ordersThisMonth)} />
        <StatCard label="Processing" value={String(counts.processing)} />
        <StatCard label="Packed" value={String(counts.packed)} />
        <StatCard
          label="Out for delivery"
          value={String(counts.outForDelivery)}
        />
      </div>

      <OrdersManager initialOrders={enriched} />
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
