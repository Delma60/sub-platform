"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#whats-inside", label: "What's inside" },
  { href: "/#plans", label: "Plans" },
  { href: "/#faq", label: "FAQ" },
];

type User = { name: string; email: string };

export function CustomerNavbarClient({ user }: { user: User | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-3xl text-[var(--accent)]"
          onClick={() => setMobileOpen(false)}
        >
          Oja
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] text-[var(--ink-soft)] md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {user ? (
            <>
              <Link
                href="/u"
                className="flex items-center gap-2 text-[13px] font-medium text-[var(--ink)] transition hover:text-[var(--accent)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[11px] font-medium text-[var(--accent)]">
                  {initials || "?"}
                </span>
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-[13px] font-medium text-[var(--ink)] transition hover:text-[var(--accent)]"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#243020]"
              >
                Start your subscription
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-9 w-9 items-center justify-center text-[var(--ink)] md:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--line)] px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-[var(--ink-soft)]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="mt-2 flex flex-col gap-3 border-t border-[var(--line)] pt-4">
                <Link
                  href="/u"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[11px] font-medium text-[var(--accent)]">
                    {initials || "?"}
                  </span>
                  Dashboard
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-medium text-[var(--ink-soft)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-md bg-[var(--accent)] px-5 py-3 text-center text-sm font-medium text-white"
                >
                  Start your subscription
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
