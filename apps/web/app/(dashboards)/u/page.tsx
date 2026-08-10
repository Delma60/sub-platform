import Link from "next/link";
import { getCurrentUser } from "../../lib/get-current-user";
import {
  getActiveSubscription,
  getPlan,
  listDeliveries,
  listOrders,
} from "../../api/lib/data-store";
import { StatusBadge } from "./components/status-badge";

function cycleDaysForFrequency(frequency: string) {
  return frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(new Date().getHours());

  const subscription = user ? await getActiveSubscription(user.id) : null;
  const plan = subscription ? await getPlan(subscription.planId) : null;
  const orders = user ? await listOrders(user.id) : [];
  const deliveries = user ? await listDeliveries(user.id) : [];
  const nextDelivery = deliveries.find((d) => d.status !== "delivered");
  const recentOrders = orders.slice(0, 4);

  const initials = (user?.name ?? "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  let cycleProgress: number | null = null;
  let daysUntil: number | null = null;
  if (subscription && plan && nextDelivery) {
    const totalDays = cycleDaysForFrequency(plan.frequency);
    const nowMs = new Date().getTime();
    const msLeft = new Date(nextDelivery.scheduledDate).getTime() - nowMs;
    const rawDaysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    daysUntil = Math.max(0, rawDaysLeft);
    const elapsed = Math.min(totalDays, Math.max(0, totalDays - daysUntil));
    cycleProgress = Math.min(1, Math.max(0, elapsed / totalDays));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-[#E4DCC8] bg-[#FAF6EF] p-8 shadow-[0_30px_80px_rgba(23,37,28,0.06)]">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#BC8A31]">
              {greeting}
            </p>
            <h1 className="mt-2 font-display text-3xl text-[#17251C]">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 max-w-sm text-[15px] text-[#6B6558]">
              {subscription && plan
                ? `Your ${plan.name.toLowerCase()} box is on track. Here's what's coming up.`
                : "Choose a plan to get your first box on the calendar."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/u/subscription"
              className="rounded-md bg-[#24402F] px-4 py-2.5 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24402F]/40"
            >
              {subscription ? "Manage subscription" : "Choose a plan"}
            </Link>
            <Link
              href="/u/addresses"
              className="rounded-md border border-[#17251C]/15 px-4 py-2.5 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24402F]/30"
            >
              Add address
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-6 hidden w-56 grid-cols-3 grid-rows-3 gap-2 opacity-70 md:grid">
          <div className="col-span-2 row-span-2 rounded-xl bg-[#DCD0B7]" />
          <div className="rounded-xl bg-[#24402F]" />
          <div className="rounded-xl bg-[#FAF6EF] ring-1 ring-[#E4DCC8]" />
          <div className="col-span-2 rounded-xl bg-[#BC8A31]/10 ring-1 ring-[#BC8A31]/15" />
          <div className="rounded-xl bg-[#17251C]" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
              Subscription
            </p>
            <IconBadge tone="green">
              <BoxGlyph />
            </IconBadge>
          </div>

          {subscription && plan ? (
            <>
              <p className="mt-4 text-xl font-semibold text-[#17251C]">
                {plan.name} plan
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#6B6558]">
                ₦{plan.price.toLocaleString()} / {plan.frequency}
                <StatusBadge status={subscription.status} />
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-xl font-semibold text-[#17251C]">
                No active plan
              </p>
              <p className="mt-2 text-sm text-[#6B6558]">
                You haven&apos;t subscribed to a box yet.
              </p>
            </>
          )}
          <Link
            href="/u/subscription"
            className="mt-4 inline-block text-sm font-medium text-[#24402F] underline"
          >
            {subscription ? "View plan details" : "Choose a plan"}
          </Link>
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
              Next delivery
            </p>
            <IconBadge tone="gold">
              <TruckGlyph />
            </IconBadge>
          </div>

          {nextDelivery ? (
            <div className="mt-3 flex items-center gap-4">
              <DeliveryRing progress={cycleProgress ?? 0} />
              <div>
                <p className="text-lg font-semibold leading-tight text-[#17251C]">
                  {new Date(nextDelivery.scheduledDate).toLocaleDateString(
                    "en-NG",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
                <p className="text-xs text-[#6B6558]">
                  {daysUntil === 0
                    ? "Arriving today"
                    : daysUntil === 1
                      ? "1 day away"
                      : `${daysUntil} days away`}
                </p>
                <div className="mt-2">
                  <StatusBadge status={nextDelivery.status} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-4 text-xl font-semibold text-[#17251C]">
                Nothing scheduled
              </p>
              <p className="mt-2 text-sm text-[#6B6558]">
                Your next delivery date will show up here once you&apos;re
                subscribed.
              </p>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
              Account
            </p>
            <IconBadge tone="green">
              <UserGlyph />
            </IconBadge>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#BC8A31]/15 text-sm font-medium text-[#BC8A31]">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[#17251C]">
                {user?.name}
              </p>
              <p className="truncate text-sm text-[#6B6558]">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/u/settings"
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
            href="/u/orders"
            className="text-sm text-[#24402F] underline"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
            <p className="text-sm font-medium text-[#17251C]">No orders yet</p>
            <p className="max-w-xs text-sm text-[#6B6558]">
              Orders are generated automatically from your subscription once
              it&apos;s active.
            </p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col divide-y divide-[#E4DCC8]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2ECDE] text-[#24402F]">
                    <OrderGlyph />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#17251C]">
                      Order #{order.id.split("_")[1]}
                    </p>
                    <p className="text-xs text-[#6B6558]">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
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

function DeliveryRing({ progress }: { progress: number }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E4DCC8"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#24402F"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function IconBadge({
  tone,
  children,
}: {
  tone: "green" | "gold";
  children: React.ReactNode;
}) {
  const styles =
    tone === "green"
      ? "bg-[#24402F]/10 text-[#24402F]"
      : "bg-[#BC8A31]/10 text-[#BC8A31]";
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full ${styles}`}
    >
      {children}
    </span>
  );
}

function BoxGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
      <path
        d="M2.5 6.2 10 2.5l7.5 3.7v7.6L10 17.5l-7.5-3.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M2.7 6.4 10 10l7.3-3.6M10 10v7.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TruckGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
      <path
        d="M2.5 5.5h8v7h-8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 8.5h3.3L16 11v1.5h-5.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="5.5"
        cy="14"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="13" cy="14" r="1.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function UserGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.5 17c1-3.2 3.8-5 6.5-5s5.5 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OrderGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={15} height={15}>
      <path
        d="M4 3.5h12v14l-3-1.8-3 1.8-3-1.8-3 1.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 7.5h6M7 10.5h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
