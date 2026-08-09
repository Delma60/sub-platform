import { getCurrentUser } from "../../lib/get-current-user";
import { listAddresses, listDeliveries } from "../../api/lib/data-store";
import { StatusBadge } from "../components/status-badge";

export default async function DeliveriesPage() {
  const user = await getCurrentUser();
  const deliveries = user ? listDeliveries(user.id) : [];
  const addresses = user ? listAddresses(user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">Deliveries</p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Delivery tracking</h1>
      </div>

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
            <p className="text-sm font-medium text-[#17251C]">No deliveries yet</p>
            <p className="max-w-xs text-sm text-[#6B6558]">
              Deliveries appear here once your subscription starts generating orders.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#E4DCC8]">
            {deliveries.map((delivery) => {
              const address = addresses.find((a) => a.id === delivery.addressId);
              return (
                <div
                  key={delivery.id}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#17251C]">
                      {new Date(delivery.scheduledDate).toLocaleDateString("en-NG", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-[#6B6558]">
                      {address
                        ? `${address.label} · ${address.city}, ${address.state}`
                        : "No address on file — add one in Addresses"}
                    </p>
                  </div>
                  <StatusBadge status={delivery.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
