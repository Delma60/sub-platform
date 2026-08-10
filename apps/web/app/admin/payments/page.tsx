export default function AdminPaymentsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Payments</h1>
        <p className="mt-2 text-slate-600">
          Review payment events, transaction status, and reconciliation details.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        This page will show payment logs and revenue summaries.
      </div>
    </section>
  );
}
