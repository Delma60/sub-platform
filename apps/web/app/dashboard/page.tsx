import Link from "next/link";
import { getCurrentUser } from "../lib/get-current-user";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";

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
          <p className="mt-3 text-xl font-semibold text-[#17251C]">
            No active plan
          </p>
          <p className="mt-2 text-sm text-[#6B6558]">
            You haven't subscribed to a box yet. Choose a plan to get your first
            delivery on the calendar.
          </p>
          <Link
            href="/#plans"
            className="mt-4 inline-block rounded-md bg-[#24402F] px-4 py-2 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22]"
          >
            Choose a plan
          </Link>
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
            Next delivery
          </p>
          <p className="mt-3 text-xl font-semibold text-[#17251C]">
            Nothing scheduled
          </p>
          <p className="mt-2 text-sm text-[#6B6558]">
            Your next delivery date will show up here once you're subscribed.
          </p>
        </div>

        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">
            Account
          </p>
          <p className="mt-3 text-xl font-semibold text-[#17251C]">
            {user?.name}
          </p>
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
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center">
          <p className="text-sm font-medium text-[#17251C]">No orders yet</p>
          <p className="max-w-xs text-sm text-[#6B6558]">
            Orders are generated automatically from your subscription once it's
            active.
          </p>
        </div>
      </div>
    </div>
  );
}
