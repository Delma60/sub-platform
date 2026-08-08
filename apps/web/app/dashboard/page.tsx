export default function DashboardOverviewPage() {
  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-[#FAF6EF] p-8 shadow-[0_30px_80px_rgba(23,37,28,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#BC8A31]">Overview</p>
          <h1 className="mt-2 text-3xl font-display text-[#17251C]">
            Welcome back, Adaeze.
          </h1>
        </div>
        <div className="rounded-full bg-[#17251C] px-4 py-2 text-sm text-[#FAF6EF]">
          Fresh deliveries, curated for you
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">Next delivery</p>
          <p className="mt-3 text-xl font-semibold text-[#17251C]">Monday, Aug 11</p>
          <p className="mt-2 text-sm text-[#6B6558]">Your box will arrive between 8am and 12pm.</p>
        </div>
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">Plan status</p>
          <p className="mt-3 text-xl font-semibold text-[#17251C]">Active</p>
          <p className="mt-2 text-sm text-[#6B6558]">Weekly delivery, 5 items remaining this month.</p>
        </div>
        <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.26em] text-[#6B6558]">Latest order</p>
          <p className="mt-3 text-xl font-semibold text-[#17251C]">Mixed harvest box</p>
          <p className="mt-2 text-sm text-[#6B6558]">Delivered Aug 4 — review or reorder from your account.</p>
        </div>
      </div>
    </div>
  );
}
