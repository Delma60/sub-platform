"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "../components/status-badge";

type Plan = {
  id: string;
  name: string;
  price: number;
  frequency: string;
  features: string[];
};

type Subscription = {
  id: string;
  planId: string;
  status: "active" | "paused" | "cancelled";
  nextDeliveryDate: string;
} | null;

export function SubscriptionManager({
  plans,
  subscription,
  currentPlanName,
}: {
  plans: Plan[];
  subscription: Subscription;
  currentPlanName: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't subscribe. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function runAction(
    action: "pause" | "resume" | "cancel" | "change_plan",
    planId?: string,
  ) {
    if (!subscription) return;
    setLoading(planId ?? action);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          planId ? { action: "change_plan", planId } : { action },
        ),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {subscription && (
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
                Current plan
              </p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-[#17251C]">
                {currentPlanName} <StatusBadge status={subscription.status} />
              </p>
              <p className="mt-1 text-sm text-[#6B6558]">
                Next delivery:{" "}
                {new Date(subscription.nextDeliveryDate).toLocaleDateString(
                  "en-NG",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {subscription.status === "active" && (
                <button
                  onClick={() => runAction("pause")}
                  disabled={loading !== null}
                  className="rounded-md border border-[#E4DCC8] px-4 py-2 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04] disabled:opacity-60"
                >
                  {loading === "pause" ? "Pausing…" : "Pause"}
                </button>
              )}
              {subscription.status === "paused" && (
                <button
                  onClick={() => runAction("resume")}
                  disabled={loading !== null}
                  className="rounded-md border border-[#E4DCC8] px-4 py-2 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04] disabled:opacity-60"
                >
                  {loading === "resume" ? "Resuming…" : "Resume"}
                </button>
              )}
              <button
                onClick={() => runAction("cancel")}
                disabled={loading !== null}
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                {loading === "cancel" ? "Cancelling…" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white p-8 ${
                isCurrent
                  ? "border-2 border-[#24402F] shadow-md"
                  : "border border-[#E4DCC8]"
              }`}
            >
              {isCurrent && (
                <span className="mb-4 inline-block rounded-full bg-[#BC8A31] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FAF6EF]">
                  Current plan
                </span>
              )}
              <h3 className="font-display text-2xl text-[#17251C]">
                {plan.name}
              </h3>
              <p className="mt-6">
                <span className="font-display text-4xl text-[#17251C]">
                  ₦{plan.price.toLocaleString()}
                </span>
                <span className="text-sm text-[#6B6558]">
                  {" "}
                  / {plan.frequency}
                </span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-[#17251C]">
                    • {feature}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <button
                  onClick={() =>
                    subscription
                      ? runAction("change_plan", plan.id)
                      : subscribe(plan.id)
                  }
                  disabled={loading !== null}
                  className="mt-8 block w-full rounded-md bg-[#24402F] px-6 py-3 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22] disabled:opacity-60"
                >
                  {loading === plan.id
                    ? "Updating…"
                    : subscription
                      ? "Switch to this plan"
                      : "Choose plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
