import { notFound } from "next/navigation";
import {
  listAllAddresses,
  listAllDeliveries,
  listAllOrders,
  listPlans,
} from "../../../../api/lib/data-store";
import { listUsersByIds } from "../../../../api/lib/store";
import { DeliveryStatusPill } from "../../../u/deliveries/delivery-status-pill";
import { DeliveryDetailActions } from "./delivery-detail-actions";

export default async function RiderDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [deliveries, orders, addresses, plans] = await Promise.all([
    listAllDeliveries(),
    listAllOrders(),
    listAllAddresses(),
    listPlans(),
  ]);

  const delivery = deliveries.find((d) => d.id === id);
  if (!delivery) notFound();

  const order = orders.find((o) => o.id === delivery.orderId);
  const plan = order ? plans.find((p) => p.id === order.planId) : null;
  const address = delivery.addressId
    ? addresses.find((a) => a.id === delivery.addressId)
    : null;
  const usersById = await listUsersByIds([delivery.userId]);
  const customer = usersById.get(delivery.userId);

  const maps = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [address.line1, address.line2, address.city, address.state]
          .filter(Boolean)
          .join(", "),
      )}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Delivery #{delivery.id.split("_")[1]}
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          {customer?.name ?? "Customer"}
        </h1>
        <div className="mt-2">
          <DeliveryStatusPill status={delivery.status} />
        </div>
      </div>

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6B6558]">
          Stop details
        </p>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[#6B6558]">Order</dt>
            <dd className="mt-1 text-sm text-[#17251C]">
              #{delivery.orderId.split("_")[1]} · {plan?.name ?? "Plan"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#6B6558]">Scheduled</dt>
            <dd className="mt-1 text-sm text-[#17251C]">
              {new Date(delivery.scheduledDate).toLocaleDateString("en-NG", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#6B6558]">Address</dt>
            <dd className="mt-1 text-sm text-[#17251C]">
              {address
                ? `${address.label} · ${address.line1}${
                    address.line2 ? `, ${address.line2}` : ""
                  }, ${address.city}, ${address.state}`
                : "No address on file"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#6B6558]">Contact</dt>
            <dd className="mt-1 text-sm text-[#17251C]">
              {customer?.phone ?? "No phone on file"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-4">
          {customer?.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="rounded-full border border-[#E4DCC8] px-4 py-2 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
            >
              Call customer
            </a>
          )}
          {maps && (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#E4DCC8] px-4 py-2 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
            >
              Get directions
            </a>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6B6558]">
          Update status
        </p>
        <div className="mt-4">
          <DeliveryDetailActions deliveryId={delivery.id} status={delivery.status} />
        </div>
      </div>
    </div>
  );
}
