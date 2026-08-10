export default function AdminOrdersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
        <p className="mt-2 text-slate-600">
          Track order history, fulfillment status, and customer delivery progress.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        This page will contain order tables, search, filters, and detail actions.
      </div>
    </section>
  );
}
