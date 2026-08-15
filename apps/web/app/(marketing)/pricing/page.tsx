import type { Metadata } from "next";
import Link from "next/link";
import { listPlans } from "../../api/lib/data-store";

export const metadata: Metadata = {
  title: "Subscription plans | Oja",
  description: "Compare Oja market box plans and choose a delivery schedule for your kitchen.",
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export default async function PricingPage() {
  const plans = await listPlans();
  return (
    <main className="min-h-screen px-6 py-20 lg:py-28"><div className="mx-auto max-w-6xl">
      <p className="eyebrow">Simple pricing</p>
      <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">A box for every kitchen</h1>
      <p className="mt-5 max-w-2xl text-lg text-[var(--ink-soft)]">Fresh staples on a dependable schedule. Every plan can be paused or cancelled from your dashboard.</p>
      {plans.length === 0 ? <p className="mt-12 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8">Plans are temporarily unavailable. Please check back soon.</p> : <div className="mt-12 grid gap-6 md:grid-cols-3">{plans.map((plan) => (
        <article key={plan.id} className={`flex flex-col premium-card p-8 ${plan.id === "family" ? "border-2 border-[var(--harvest)] shadow-[0_24px_70px_rgba(22,75,53,0.12)]" : "border border-[var(--line)]"}`}>
          {plan.id === "family" && <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent)]">Most popular</p>}
          <h2 className="mt-3 text-2xl font-semibold">{plan.name}</h2>
          <p className="mt-5"><span className="text-4xl font-semibold">{currency.format(plan.price)}</span><span className="text-sm capitalize text-[var(--ink-soft)]"> / {plan.frequency}</span></p>
          <ul className="mt-8 flex-1 space-y-3 text-sm text-[var(--ink-soft)]">{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
          <Link href={`/checkout?plan=${plan.id}`} className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold ${plan.id === "family" ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]" : "border border-[var(--line)] hover:bg-[var(--accent-soft)]"}`}>Choose {plan.name}</Link>
        </article>
      ))}</div>}
    </div></main>
  );
}
