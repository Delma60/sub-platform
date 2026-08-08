import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-20">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <p className="text-slate-600">
        Manage subscriptions, orders, inventory, and customer operations.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/products"
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Products
        </Link>
        <Link href="/admin/subscriptions" className="rounded border px-4 py-2">
          Subscriptions
        </Link>
      </div>
    </main>
  );
}
