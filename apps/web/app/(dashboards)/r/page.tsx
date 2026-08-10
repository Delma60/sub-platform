import { listAllAddresses, listAllDeliveries } from "../../api/lib/data-store";
import { listUsersByIds } from "../../api/lib/store";
import { StatusBadge } from "../u/components/status-badge";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function RiderPage() {
  const [deliveries, addresses] = await Promise.all([
    listAllDeliveries(),
    listAllAddresses(),
  ]);
  const today = new Date();
  const todaysDeliveries = deliveries.filter((delivery) =>
    isSameDay(new Date(delivery.scheduledDate), today)
  );
  const users = await listUsersByIds(todaysDeliveries.map((delivery) => delivery.userId));
  const addressById = new Map(addresses.map((address) => [address.id, address]));

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
            {todaysDeliveries.length} stops scheduled for this route.
          </p>
        </div>
        <div className="rounded-lg border border-[#E4DCC8] bg-white px-4 py-3 text-sm text-[#6B6558]">
          {today.toLocaleDateString("en-NG", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#E4DCC8] bg-white">
        {todaysDeliveries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-[#17251C]">No deliveries today</p>
            <p className="mt-2 text-sm text-[#6B6558]">
              Scheduled route stops will show here when orders are ready.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4DCC8]">
            {todaysDeliveries.map((delivery) => {
              const customer = users.get(delivery.userId);
              const address = delivery.addressId
                ? addressById.get(delivery.addressId)
                : null;

              return (
                <article
                  key={delivery.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[1.3fr_1fr_auto]"
                >
                  <div>
                    <p className="font-medium text-[#17251C]">
                      {customer?.name ?? "Customer"}
                    </p>
                    <p className="mt-1 text-sm text-[#6B6558]">
                      Order {delivery.orderId}
                    </p>
                  </div>

                  <div className="text-sm text-[#6B6558]">
                    {address ? (
                      <>
                        <p className="font-medium text-[#17251C]">{address.label}</p>
                        <p>
                          {address.line1}, {address.city}, {address.state}
                        </p>
                      </>
                    ) : (
                      <p>No address selected</p>
                    )}
                  </div>

                  <div className="flex items-start justify-end">
                    <StatusBadge status={delivery.status} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
