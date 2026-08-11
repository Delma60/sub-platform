"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Package, ShieldCheck, Truck, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/r", label: "Today", icon: Package },
  { href: "/r/deliveries", label: "All deliveries", icon: Truck },
];

type Rider = {
  name: string;
  role: "customer" | "admin" | "rider";
};

export function RiderSidebar({ rider }: { rider: Rider }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const initials = rider.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Top bar — always visible */}
      <header className="sticky top-0 z-40 border-b border-[#E4DCC8] bg-[#FAF6EF]/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#17251C] transition hover:bg-[#17251C]/[0.06]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/r" className="font-display text-xl text-[#17251C]">
            Oja Rider
          </Link>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#17251C]/40 backdrop-blur-[1px] transition-opacity"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[#E4DCC8] bg-white transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Rider navigation"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/r"
            onClick={() => setOpen(false)}
            className="font-display text-2xl text-[#17251C]"
          >
            Oja Rider
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B6558] transition hover:bg-[#17251C]/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#24402F] text-white"
                    : "text-[#17251C] hover:bg-[#17251C]/[0.05]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {rider.role === "admin" && (
            <Link
              href="/a"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.05]"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="mt-auto border-t border-[#E4DCC8] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDE6D4] text-xs font-semibold text-[#24402F]">
              {initials || "?"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#17251C]">{rider.name}</p>
              <p className="text-xs uppercase tracking-[0.1em] text-[#BC8A31]">
                {rider.role === "admin" ? "Admin" : "Rider"}
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST" className="mt-4">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl border border-[#E4DCC8] px-3 py-2.5 text-sm font-medium text-[#6B6558] transition hover:border-[#24402F] hover:text-[#17251C]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
