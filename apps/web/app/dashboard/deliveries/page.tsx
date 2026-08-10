import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getCurrentUser } from "../../lib/get-current-user";
import { listAddresses, listDeliveries } from "../../api/lib/data-store";
import { DeliveriesList } from "./deliveries-list";
import { DeliveryStatusPill } from "./delivery-status-pill";

const WEEK_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default async function DeliveriesPage() {
  const user = await getCurrentUser();
  const deliveries = user ? await listDeliveries(user.id) : [];
  const addresses = user ? await listAddresses(user.id) : [];

  const enriched = deliveries.map((delivery) => ({
    ...delivery,
    address:
      delivery.addressId != null
        ? (addresses.find((address) => address.id === delivery.addressId) ??
          null)
        : null,
  }));

  const upcoming = enriched
    .filter((d) => d.status === "scheduled" || d.status === "out_for_delivery" || d.status === "issue")
    .sort((a, b) => (a.scheduledDate < b.scheduledDate ? -1 : 1));

  const past = enriched
    .filter((d) => d.status === "delivered" || d.status === "skipped")
    .sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1));

  const next = upcoming[0] ?? null;
  const hasAddresses = addresses.length > 0;
  const nextDayIndex = next
    ? (new Date(next.scheduledDate).getDay() + 6) % 7
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Deliveries
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Delivery tracking
        </h1>
      </div>

      {!hasAddresses && (
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#15150F]">
                No delivery address on file
              </p>
              <p className="mt-1 text-sm text-[#6B6558]">
                Add one so future deliveries go to the right place.
              </p>
            </div>
            <Link
              href="/dashboard/addresses"
              className="shrink-0 rounded-full bg-[#2E3B29] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#243020]"
            >
              Add address
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        {next ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B6558]">
                  Next delivery
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-[#17251C]">
                  {new Date(next.scheduledDate).toLocaleDateString("en-NG", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-3 text-sm text-[#6B6558]">
                  {next.address
                    ? `${next.address.label} · ${next.address.line1}, ${next.address.city}`
                    : "No address on file for this delivery"}
                </p>
                <div className="mt-4">
                  <DeliveryStatusPill status={next.status} />
                </div>
              </div>

              {nextDayIndex !== null && (
                <div className="w-full max-w-[240px] shrink-0">
                  <div className="relative h-px bg-[#E6E3DA]">
                    <div
                      className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-[#2E3B29]"
                      style={{ left: `${(nextDayIndex / 6) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.08em] text-[#6B6558]">
                    {WEEK_LETTERS.map((letter, index) => (
                      <span
                        key={index}
                        className={
                          index === nextDayIndex
                            ? "font-semibold text-[#17251C]"
                            : ""
                        }
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {next.status === "issue" && (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] p-4 sm:flex-row sm:items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6D8D4] text-[#B3261E]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#B3261E]">
                    There’s an issue with this delivery
                  </p>
                  <p className="mt-1 text-sm text-[#8A3B34]">
                    Contact support if you haven’t heard from us about a
                    resolution.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-14 text-center">
            <p className="text-sm font-medium text-[#17251C]">
              Nothing scheduled
            </p>
            <p className="max-w-xs text-sm text-[#6B6558]">
              Deliveries appear here once your subscription starts generating
              orders.
            </p>
            <Link
              href="/dashboard/subscription"
              className="mt-3 text-sm font-medium text-[#2E3B29] underline"
            >
              Choose a plan
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard label="Upcoming" value={String(upcoming.length)} />
        <StatCard label="Delivered" value={String(past.length)} />
      </div>

      <DeliveriesList
        upcoming={next ? upcoming.slice(1) : upcoming}
        past={past}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6B6558]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[#17251C]">{value}</p>
    </div>
  );
}
