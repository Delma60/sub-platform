export default function AdminDeliveriesPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Deliveries</h1>
        <p className="mt-2 text-slate-600">
          Coordinate delivery routes, assign riders, and review fulfillment progress.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        This page will manage today's delivery list and delivery status updates.
      </div>
    </section>
  );
}
