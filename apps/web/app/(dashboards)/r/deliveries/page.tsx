import {
  listAllAddresses,
  listAllDeliveries,
  listAllOrders,
  listPlans,
} from "../../../api/lib/data-store";
import { getCurrentRider } from "../../../lib/get-current-rider";
import { listUsersByIds } from "../../../api/lib/store";
import { RiderDeliveriesList } from "./rider-deliveries-list";

export default async function RiderAllDeliveriesPage() {
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

  const usersById = await listUsersByIds(deliveries.map((d) => d.userId));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const addressMap = new Map(addresses.map((a) => [a.id, a]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  const enriched = assignedDeliveries
    .map((delivery) => {
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
    })
    .sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Rider route
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          All deliveries
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Every delivery across all customers — filter by status or search for
          a stop.
        </p>
      </div>

      <RiderDeliveriesList initialDeliveries={enriched} />
    </div>
  );
}
