import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-20">
      <h1 className="text-4xl font-semibold">Contact Us</h1>
      <p className="max-w-2xl text-lg text-slate-600">
        Reach out to the support team for subscription requests, order issues,
        or business partnerships.
      </p>
      <Link href="/" className="text-blue-600 underline">
        Back home
      </Link>
    </main>
  );
}
