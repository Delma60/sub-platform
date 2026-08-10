"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      const isAdmin = json?.data?.user?.role === "admin";
      const destination = requestedNext
        ? requestedNext === "/admin" && !isAdmin
          ? "/dashboard"
          : requestedNext
        : isAdmin
          ? "/admin"
          : "/dashboard";

      await router.push(destination);
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#FAF6EF] text-[#17251C] md:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-5 md:px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-2xl">
            Oja
          </Link>

          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[#BC8A31]">
            Start fresh
          </p>
          <h1 className="mt-2 font-display text-3xl leading-[1.05]">
            Create your account
          </h1>
          <p className="mt-1 text-[15px] text-[#6B6558]">
            Get started with weekly delivery, flexible swaps, and easy pauses.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-[#E4DCC8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#24402F]"
                placeholder="Jane Doe"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-[#E4DCC8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#24402F]"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-[#E4DCC8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#24402F]"
                placeholder="••••••••"
              />
              <p className="text-xs text-[#6B6558]">At least 8 characters.</p>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-md bg-[#24402F] px-5 py-3 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22] disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-4 border-t border-[#E4DCC8] pt-3 text-sm text-[#6B6558]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#24402F] underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-[#DCD0B7]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17251C]/80 via-[#17251C]/10 to-transparent" />

        <div className="absolute right-8 top-8 flex h-20 w-20 rotate-6 items-center justify-center rounded-full border border-[#FAF6EF]/70 text-center">
          <span className="font-display text-[10px] uppercase leading-tight tracking-[0.12em] text-[#FAF6EF]">
            Farm
            <br />
            Direct
            <br />
            <span className="italic">Est. Oja</span>
          </span>
        </div>

        <div className="absolute bottom-10 left-8 right-8">
          <blockquote className="font-display text-2xl italic leading-snug text-[#FAF6EF]">
            "Set up in under three minutes and skip your next market run."
          </blockquote>
          <p className="mt-3 text-[13px] uppercase tracking-[0.12em] text-[#FAF6EF]/60">
            Weekly delivery · Flexible swaps
          </p>
        </div>
      </div>
    </main>
  );
}
