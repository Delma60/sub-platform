import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">Admin</p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Overview</h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Manage subscriptions, orders, inventory, and customer operations.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products"
          className="rounded-md bg-[#24402F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a2f22]"
        >
          Products
        </Link>
        <Link
          href="/admin/subscriptions"
          className="rounded-md border border-[#E4DCC8] px-4 py-2.5 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
        >
          Subscriptions
        </Link>
      </div>
    </div>
  );
}
