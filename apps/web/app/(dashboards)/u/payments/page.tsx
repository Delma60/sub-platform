import { getCurrentUser } from "../../../lib/get-current-user";
import { listOrders, listPayments, listPlans } from "../../../api/lib/data-store";
import { PaymentsList } from "./payments-list";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  const payments = user ? await listPayments(user.id) : [];
  const orders = user ? await listOrders(user.id) : [];
  const plans = user ? await listPlans() : [];

  const planMap = new Map(plans.map((plan) => [plan.id, plan]));
  const orderMap = new Map(orders.map((order) => [order.id, order]));

  const enriched = payments.map((payment) => {
    const order = orderMap.get(payment.orderId);
    const plan = order ? planMap.get(order.planId) : null;
    return {
      ...payment,
      planName: plan?.name ?? null,
    };
  });

  const totalPaid = payments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const failedCount = payments.filter(
    (payment) => payment.status === "failed",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#706C60]">
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.015em] text-[#15150F]">
          Payment history
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#706C60]">
          Every charge made against your subscription.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Total paid" value={`₦${totalPaid.toLocaleString()}`} />
        <StatCard
          label="Pending"
          value={pendingAmount > 0 ? `₦${pendingAmount.toLocaleString()}` : "—"}
          tone={pendingAmount > 0 ? "neutral" : "muted"}
        />
        <StatCard
          label="Failed"
          value={String(failedCount)}
          tone={failedCount > 0 ? "warning" : "muted"}
        />
      </div>

      <PaymentsList payments={enriched} />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "neutral" | "warning";
}) {
  const valueColor = tone === "warning" ? "text-[#B3261E]" : "text-[#15150F]";
  return (
    <div className="rounded-lg border border-[#E6E3DA] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#706C60]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
