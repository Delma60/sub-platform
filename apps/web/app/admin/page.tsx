import Link from "next/link";
import {
  AlertTriangle,
  Users,
  Wallet,
  PackageCheck,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  listAllSubscriptions,
  listAllOrders,
  listAllPayments,
  listAllDeliveries,
  listPlans,
  monthlyEquivalentRevenue,
} from "../api/lib/data-store";
import { listUsersByIds, countUsers } from "../api/lib/store";
import { StatusBadge } from "../dashboard/components/status-badge";

export default async function AdminPage() {
  const [subscriptions, orders, payments, deliveries, customerCount] =
    await Promise.all([
      listAllSubscriptions(),
      listAllOrders(),
      listAllPayments(),
      listAllDeliveries(),
      countUsers("customer"),
    ]);

  const plans = await listPlans();
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));
  const activeSubs = subscriptions.filter((s) => s.status === "active");

  const mrr = Math.round(
    activeSubs.reduce((sum, sub) => {
      const plan = planMap.get(sub.planId);
      return plan ? sum + monthlyEquivalentRevenue(plan) : sum;
    }, 0),
  );

  const now = new Date();
  const ordersThisMonth = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const pendingDeliveries = deliveries.filter(
    (d) => d.status === "scheduled" || d.status === "out_for_delivery",
  ).length;
  const issueDeliveries = deliveries.filter((d) => d.status === "issue").length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;

  const recentOrders = orders.slice(0, 6);
  const recentPayments = payments.slice(0, 6);

  const relevantUserIds = [
    ...recentOrders.map((o) => o.userId),
    ...recentPayments.map((p) => p.userId),
  ];
  const usersById = await listUsersByIds(relevantUserIds);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Overview</h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Live snapshot of subscriptions, orders, and deliveries across all
          customers.
        </p>
      </div>

      {(issueDeliveries > 0 || failedPayments > 0) && (
        <div className="flex flex-col gap-3 rounded-3xl border border-[#F3D4CF] bg-[#FBEAE7] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6D8D4] text-[#B3261E]">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <p className="text-sm text-[#8A3B34]">
              {issueDeliveries > 0 &&
                `${issueDeliveries} delivery issue${issueDeliveries === 1 ? "" : "s"}`}
              {issueDeliveries > 0 && failedPayments > 0 && " · "}
              {failedPayments > 0 &&
                `${failedPayments} failed payment${failedPayments === 1 ? "" : "s"}`}{" "}
              need attention
            </p>
          </div>
          <div className="flex gap-4">
            {issueDeliveries > 0 && (
              <Link
                href="/admin/deliveries"
                className="text-sm font-medium text-[#B3261E] underline"
              >
                Review deliveries
              </Link>
            )}
            {failedPayments > 0 && (
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-[#B3261E] underline"
              >
                Review payments
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active subscriptions"
          value={String(activeSubs.length)}
          icon={Users}
        />
        <StatCard
          label="MRR"
          value={`₦${mrr.toLocaleString()}`}
          icon={Wallet}
        />
        <StatCard
          label="Customers"
          value={String(customerCount)}
          icon={Users}
        />
        <StatCard
          label="Orders this month"
          value={String(ordersThisMonth)}
          icon={PackageCheck}
        />
        <StatCard
          label="Pending deliveries"
          value={String(pendingDeliveries)}
          icon={Truck}
        />
        <StatCard
          label="Failed payments"
          value={String(failedPayments)}
          icon={AlertTriangle}
          tone={failedPayments > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#6B6558]">
          Active subscriptions by plan
        </p>
        <div className="mt-5 flex flex-col gap-4">
          {plans.map((plan) => {
            const count = activeSubs.filter((s) => s.planId === plan.id).length;
            const pct = activeSubs.length
              ? Math.round((count / activeSubs.length) * 100)
              : 0;
            return (
              <div key={plan.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#17251C]">
                    {plan.name}
                  </span>
                  <span className="text-[#6B6558]">
                    {count} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#F1EFE5]">
                  <div
                    className="h-1.5 rounded-full bg-[#24402F]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-[#6B6558]">
              Recent orders
            </p>
            <Link
              href="/admin/orders"
              className="text-sm text-[#24402F] underline"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B6558]">No orders yet.</p>
          ) : (
            <div className="mt-5 flex flex-col divide-y divide-[#E4DCC8]">
              {recentOrders.map((order) => {
                const orderUser = usersById.get(order.userId);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#17251C]">
                        {orderUser?.name ?? "Unknown customer"}
                      </p>
                      <p className="text-xs text-[#6B6558]">
                        {planMap.get(order.planId)?.name ?? "Plan"} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-[#17251C]">
                        ₦{order.total.toLocaleString()}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-[#6B6558]">
              Recent payments
            </p>
            <Link
              href="/admin/payments"
              className="text-sm text-[#24402F] underline"
            >
              View all
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B6558]">No payments yet.</p>
          ) : (
            <div className="mt-5 flex flex-col divide-y divide-[#E4DCC8]">
              {recentPayments.map((payment) => {
                const paymentUser = usersById.get(payment.userId);
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#17251C]">
                        {paymentUser?.name ?? "Unknown customer"}
                      </p>
                      <p className="text-xs text-[#6B6558]">
                        {payment.method} ·{" "}
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-[#17251C]">
                        ₦{payment.amount.toLocaleString()}
                      </span>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "warning";
}) {
  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-[#6B6558]">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            tone === "warning"
              ? "bg-[#FBEAE7] text-[#B3261E]"
              : "bg-[#24402F]/10 text-[#24402F]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[#17251C]">{value}</p>
    </div>
  );
}
