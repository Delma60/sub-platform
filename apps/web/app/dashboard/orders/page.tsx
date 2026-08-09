import { getCurrentUser } from "../../lib/get-current-user";
import { listOrders } from "../../api/lib/data-store";
import { StatusBadge } from "../components/status-badge";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = user ? listOrders(user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Orders
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Order history
        </h1>
      </div>

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
            <p className="text-sm font-medium text-[#17251C]">No orders yet</p>
            <p className="max-w-xs text-sm text-[#6B6558]">
              Orders are generated automatically from your subscription once
              it's active.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#E4DCC8]">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#17251C]">
                    Order #{order.id.split("_")[1]}
                  </p>
                  <p className="text-xs text-[#6B6558]">
                    Placed {new Date(order.createdAt).toLocaleDateString()} ·
                    Delivery {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#17251C]">
                    ₦{order.total.toLocaleString()}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
