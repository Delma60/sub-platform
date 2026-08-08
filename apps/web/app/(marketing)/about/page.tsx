import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-20">
      <h1 className="text-4xl font-semibold">About Foodstuff</h1>
      <p className="max-w-2xl text-lg text-slate-600">
        Foodstuff helps households subscribe to fresh staples and essentials with predictable delivery schedules.
      </p>
      <Link href="/" className="text-blue-600 underline">
        Back home
      </Link>
    </main>
  );
}
