"use client";

import Link from "next/link";
import { useState } from "react";
import type { Plan } from "../../api/lib/data-store";

type ApiResponse<T> = { success: boolean; data?: T; error?: string };
const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function CheckoutForm({ plans, initialPlan }: { plans: Plan[]; initialPlan?: string }) {
  const [planId, setPlanId] = useState(plans.some((plan) => plan.id === initialPlan) ? initialPlan! : plans[0]?.id ?? "");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    if (!planId || loading) return;
    setLoading(true);
    setError(undefined);
    try {
      const subscriptionResponse = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const subscription = (await subscriptionResponse.json()) as ApiResponse<{ order: { id: string } | null }>;
      if (subscriptionResponse.status === 401) {
        window.location.assign(`/auth/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`);
        return;
      }
      if (!subscriptionResponse.ok) throw new Error(subscription.error ?? "Could not start your subscription");
      if (!subscription.data?.order) throw new Error("Your first order could not be prepared. Please contact support.");

      const paymentResponse = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: subscription.data.order.id }),
      });
      const payment = (await paymentResponse.json()) as ApiResponse<{ checkout: { paymentLink: string } }>;
      if (!paymentResponse.ok || !payment.data?.checkout.paymentLink) throw new Error(payment.error ?? "Could not initialize payment");
      window.location.assign(payment.data.checkout.paymentLink);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (plans.length === 0) return <main className="grid min-h-[70vh] place-items-center px-6 py-20"><div className="max-w-lg text-center"><h1 className="text-3xl font-semibold">Plans are temporarily unavailable</h1><p className="mt-4 text-[var(--ink-soft)]">Please check back shortly.</p><Link href="/" className="mt-8 inline-block underline underline-offset-4">Back home</Link></div></main>;

  return (
    <main className="min-h-screen bg-[var(--paper)] px-6 py-16 text-[var(--ink)] sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Secure checkout</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Choose your market box</h1>
        <p className="mt-4 max-w-xl text-[var(--ink-soft)]">Select a plan, then complete payment securely with Flutterwave.</p>
        <div className="mt-10 space-y-4">
          {plans.map((plan) => (
            <label key={plan.id} className={`block cursor-pointer rounded-xl border bg-[var(--surface)] p-6 transition ${planId === plan.id ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-[var(--line)] hover:border-[var(--ink-soft)]"}`}>
              <span className="flex items-start gap-4">
                <input className="mt-1 h-4 w-4 accent-[var(--accent)]" type="radio" name="plan" value={plan.id} checked={planId === plan.id} onChange={() => setPlanId(plan.id)} />
                <span className="flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2"><strong className="text-lg">{plan.name}</strong><span className="font-semibold">{currency.format(plan.price)}</span></span>
                  <span className="mt-1 block text-sm capitalize text-[var(--ink-soft)]">{plan.frequency === "biweekly" ? "Every two weeks" : plan.frequency}</span>
                  <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--ink-soft)]">{plan.features.map((feature) => <span key={feature}>✓ {feature}</span>)}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <button type="button" onClick={checkout} disabled={!planId || loading} aria-busy={loading} className="mt-6 w-full rounded-md bg-[var(--accent)] px-6 py-4 font-medium text-white transition hover:bg-[#243020] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Preparing secure checkout…" : "Continue to Flutterwave"}</button>
        <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">You can pause or cancel your subscription from your dashboard.</p>
      </div>
    </main>
  );
}
