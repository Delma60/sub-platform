"use client";
import { useState } from "react";
import type { Plan } from "../../api/lib/data-store";

export function CheckoutForm({ plans, initialPlan }: { plans: Plan[]; initialPlan?: string }) {
  const [planId, setPlanId] = useState(plans.some((p) => p.id === initialPlan) ? initialPlan! : plans[0]?.id ?? "");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function checkout() {
    setLoading(true); setError(undefined);
    try {
      const subscriptionResponse = await fetch("/api/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
      const subscription = await subscriptionResponse.json();
      if (subscriptionResponse.status === 401) { window.location.href = `/auth/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`; return; }
      if (!subscriptionResponse.ok) throw new Error(subscription.error ?? "Could not start subscription");
      const ordersResponse = await fetch("/api/orders");
      const orders = await ordersResponse.json();
      const order = orders.data?.orders?.[0];
      if (!order) throw new Error("Your order could not be prepared");
      const paymentResponse = await fetch("/api/payments/initiate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) });
      const payment = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(payment.error ?? "Could not initialize payment");
      window.location.href = payment.data.checkout.link;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Checkout failed"); setLoading(false); }
  }
  return <main className="min-h-screen bg-[var(--paper)] px-6 py-20 text-[var(--ink)]"><div className="mx-auto max-w-xl rounded-xl border border-[var(--line)] bg-[var(--surface)] p-8">
    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Secure checkout</p><h1 className="mt-3 text-3xl font-semibold">Choose your market box</h1>
    <div className="mt-8 space-y-3">{plans.map((plan) => <label key={plan.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--line)] p-4"><span><b>{plan.name}</b><small className="block text-[var(--ink-soft)]">{plan.frequency}</small></span><span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(plan.price)} <input className="ml-3" type="radio" name="plan" checked={planId === plan.id} onChange={() => setPlanId(plan.id)} /></span></label>)}</div>
    {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button onClick={checkout} disabled={!planId || loading} className="mt-6 w-full rounded-md bg-[var(--accent)] px-6 py-3 text-white disabled:opacity-60">{loading ? "Preparing checkout…" : "Continue to Flutterwave"}</button>
  </div></main>;
}
