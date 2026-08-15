"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not request a reset");
      setMessage(payload.data.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not request a reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF6EF] px-6 text-[#17251C]">
      <section className="w-full max-w-md rounded-xl border border-[#E4DCC8] bg-white p-8">
        <Link href="/" className="font-display text-2xl">Oja</Link>
        <h1 className="mt-8 font-display text-3xl">Reset your password</h1>
        <p className="mt-2 text-sm text-[#6B6558]">We’ll email a secure link if an account matches this address.</p>
        {message ? (
          <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{message}</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-[#E4DCC8] px-4 py-3 outline-none focus:border-[#24402F]" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-md bg-[#24402F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">{loading ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        <Link href="/auth/login" className="mt-6 inline-block text-sm underline">Back to sign in</Link>
      </section>
    </main>
  );
}
