import Link from "next/link";
import { SiteHeader } from "../components/site-header";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-8 px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Foodstuff subscription platform
          </p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Fresh essentials, delivered on your schedule.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Build a modern subscription experience for groceries, staples, and
            recurring household needs.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="rounded bg-slate-900 px-5 py-3 text-white"
          >
            View plans
          </Link>
          <Link href="/admin" className="rounded border px-5 py-3">
            Open admin
          </Link>
        </div>
      </section>
    </main>
  );
}
