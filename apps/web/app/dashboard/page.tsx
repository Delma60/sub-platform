import Link from "next/link";
import { getCurrentUser } from "../lib/get-current-user";
import {
  getActiveSubscription,
  getPlan,
  listDeliveries,
  listOrders,
} from "../api/lib/data-store";
import { StatusBadge } from "./components/status-badge";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const subscription = user ? getActiveSubscription(user.id) : null;
  const plan = subscription ? getPlan(subscription.planId) : null;
  const orders = user ? listOrders(user.id) : [];
  const deliveries = user ? listDeliveries(user.id) : [];
  const nextDelivery = deliveries.find((d) => d.status !== "delivered");
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl border border-[#E4DCC8] bg-[#FAF6EF] p-8 shadow-[0_30px_80px_rgba(23,37,28,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#BC8A31]">
              Overview
            </p>
            <h1 className="mt-2 font-display text-3xl text-[#17251C]">
              Welcome back, {firstName}.
            </h1>
          </div>
          <div className="rounded-full bg-[#17251C] px-4 py-2 text-sm text-[#FAF6EF]">
            Fresh deliveries, curated for you
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
            Subscription
          </p>
          {subscription && plan ? (
            <>
              <p className="mt-3 text-xl font-semibold text-[#17251C]">
                {plan.name} plan
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#6B6558]">
                ₦{plan.price.toLocaleString()} / {plan.frequency}
                <StatusBadge status={subscription.status} />
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-xl font-semibold text-[#17251C]">
                No active plan
              </p>
              <p className="mt-2 text-sm text-[#6B6558]">
                You haven't subscribed to a box yet. Choose a plan to get your
                first delivery on the calendar.
              </p>
            </>
          )}
          <Link
            href={subscription ? "/dashboard/subscription" : "/dashboard/subscription"}
            className="mt-4 inline-block rounded-md bg-[#24402F] px-4 py-2 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22]"
          >
            {subscription ? "Manage subscription" : "Choose a plan"}
          </Link>
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
            Next delivery
          </p>
          {nextDelivery ? (
            <>
              <p className="mt-3 text-xl font-semibold text-[#17251C]">
                {new Date(nextDelivery.scheduledDate).toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="mt-2">
                <StatusBadge status={nextDelivery.status} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-xl font-semibold text-[#17251C]">
                Nothing scheduled
              </p>
              <p className="mt-2 text-sm text-[#6B6558]">
                Your next delivery date will show up here once you're subscribed.
              </p>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
            Account
          </p>
          <p className="mt-3 text-xl font-semibold text-[#17251C]">{user?.name}</p>
          <p className="mt-2 text-sm text-[#6B6558]">{user?.email}</p>
          <Link
            href="/dashboard/settings"
            className="mt-4 inline-block text-sm font-medium text-[#24402F] underline"
          >
            Manage account
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
            Recent orders
          </p>
          <Link
            href="/dashboard/orders"
            className="text-sm text-[#24402F] underline"
          >
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
            <p className="text-sm font-medium text-[#17251C]">No orders yet</p>
            <p className="max-w-xs text-sm text-[#6B6558]">
              Orders are generated automatically from your subscription once it's active.
            </p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col divide-y divide-[#E4DCC8]">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[#17251C]">
                    Order #{order.id.split("_")[1]}
                  </p>
                  <p className="text-xs text-[#6B6558]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#17251C]">₦{order.total.toLocaleString()}</span>
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
