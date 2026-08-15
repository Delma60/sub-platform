import Link from "next/link";
import { getCurrentRider } from "../../lib/get-current-rider";
import {
  listAllAddresses,
  listAllDeliveries,
  listAllOrders,
  listPlans,
} from "../../api/lib/data-store";
import { listUsersByIds } from "../../api/lib/store";
import { RiderDeliveriesList } from "./deliveries/rider-deliveries-list";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function RiderPage() {
  const rider = await getCurrentRider();
  const [deliveries, orders, addresses, plans] = await Promise.all([
    listAllDeliveries(),
    listAllOrders(),
    listAllAddresses(),
    listPlans(),
  ]);

  const assignedDeliveries = rider?.role === "admin"
    ? deliveries
    : deliveries.filter((delivery) => delivery.riderId === rider?.id);

  const today = new Date();
  const todaysDeliveries = assignedDeliveries.filter((delivery) =>
    isSameDay(new Date(delivery.scheduledDate), today),
  );

  const usersById = await listUsersByIds(todaysDeliveries.map((d) => d.userId));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const addressMap = new Map(addresses.map((a) => [a.id, a]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  const enriched = todaysDeliveries.map((delivery) => {
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
      customerName: user?.name ?? "Customer",
      customerPhone: user?.phone ?? null,
      address: address
        ? {
            label: address.label,
            line1: address.line1,
            line2: address.line2 ?? null,
            city: address.city,
            state: address.state,
          }
        : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
            Rider route
          </p>
          <h1 className="mt-2 font-display text-3xl text-[#17251C]">
            Today&apos;s deliveries
          </h1>
          <p className="mt-1 text-sm text-[#6B6558]">
            {enriched.length} stops scheduled for this route.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#E4DCC8] bg-white px-4 py-3 text-sm text-[#6B6558]">
            {today.toLocaleDateString("en-NG", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <Link
            href="/r/deliveries"
            className="rounded-lg bg-[#24402F] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1a2f22]"
          >
            All deliveries
          </Link>
        </div>
      </div>

      <RiderDeliveriesList initialDeliveries={enriched} />
    </div>
  );
}
