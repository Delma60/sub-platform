"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) return setError("Passwords do not match");
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not reset password");
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF6EF] px-6 text-[#17251C]">
      <section className="w-full max-w-md rounded-xl border border-[#E4DCC8] bg-white p-8">
        <Link href="/" className="font-display text-2xl">Oja</Link>
        <h1 className="mt-8 font-display text-3xl">Choose a new password</h1>
        {!token ? <p role="alert" className="mt-5 text-sm text-red-700">This reset link is incomplete. Request a new one.</p> : complete ? (
          <div className="mt-6"><p role="status" className="text-sm text-emerald-800">Your password has been updated.</p><Link href="/auth/login" className="mt-4 inline-block underline">Sign in</Link></div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="password">New password</label>
            <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-[#E4DCC8] px-4 py-3 outline-none focus:border-[#24402F]" />
            <label className="block text-sm font-medium" htmlFor="confirmation">Confirm password</label>
            <input id="confirmation" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-md border border-[#E4DCC8] px-4 py-3 outline-none focus:border-[#24402F]" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-md bg-[#24402F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">{loading ? "Updating…" : "Update password"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
