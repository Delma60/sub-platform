"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BoxIcon,
  ChevronIcon,
  CloseIcon,
  GearIcon,
  MenuIcon,
  OrdersIcon,
  OverviewIcon,
  PinIcon,
  ReceiptIcon,
  TruckIcon,
} from "./icons";
import { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: OverviewIcon,
        exact: true,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/subscription", label: "Subscription", icon: BoxIcon },
      { href: "/dashboard/orders", label: "Orders", icon: OrdersIcon },
      { href: "/dashboard/deliveries", label: "Deliveries", icon: TruckIcon },
      { href: "/dashboard/addresses", label: "Addresses", icon: PinIcon },
      {
        href: "/dashboard/payments",
        label: "Payment history",
        icon: ReceiptIcon,
      },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: GearIcon }],
  },
];

const WEEK_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export function DashboardSidebar({
  user,
  nextDelivery,
}: {
  user: { name: string; email: string; role: "customer" | "admin" };
  nextDelivery: { dayIndex: number; dateLabel: string } | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3 md:hidden">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[-0.01em] text-[var(--ink)]"
        >
          Oja
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--ink)]"
        >
          <MenuIcon />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] py-6 transition-all duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-[76px]" : "w-64 md:w-64"}`}
      >
        <div
          className={`flex items-center justify-between ${collapsed ? "px-3" : "px-5"}`}
        >
          {!collapsed && (
            <Link
              href="/"
              className="text-lg font-semibold tracking-[-0.01em] text-[var(--ink)]"
            >
              Oja
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="text-[var(--ink-soft)] md:hidden"
          >
            <CloseIcon />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-7 w-7 items-center justify-center rounded-md text-[var(--ink-soft)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--ink)] md:flex"
          >
            <ChevronIcon
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <nav className="mt-7 flex flex-1 flex-col overflow-y-auto px-3">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi === 0 ? "" : "mt-5"}>
              {group.label && !collapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--ink-soft)]/70">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-md py-2.5 text-[14px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 ${
                        collapsed ? "justify-center px-0" : "px-3"
                      } ${
                        active
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "text-[var(--ink-soft)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {nextDelivery && !collapsed && (
          <div className="mx-3 mt-6 rounded-md border border-[var(--line)] p-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--ink-soft)]/80">
              Next delivery
            </p>
            <p className="mt-1 text-[13px] font-medium text-[var(--ink)]">
              {nextDelivery.dateLabel}
            </p>
            <div className="relative mt-3 h-px bg-[var(--line)]">
              <div
                className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                style={{ left: `${(nextDelivery.dayIndex / 6) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-[var(--ink-soft)]">
              {WEEK_LETTERS.map((letter, i) => (
                <span
                  key={i}
                  className={
                    i === nextDelivery.dayIndex
                      ? "font-semibold text-[var(--ink)]"
                      : ""
                  }
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.role === "admin" && !collapsed && (
          <Link
            href="/admin"
            className="mx-3 mb-2 rounded-md px-3 py-2 text-[13px] font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            Switch to admin →
          </Link>
        )}

        <div
          className={`mt-6 flex items-center gap-3 border-t border-[var(--line)] pt-5 ${
            collapsed ? "justify-center px-0" : "px-5"
          }`}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[13px] font-medium text-[var(--accent)]"
            title={collapsed ? user.name : undefined}
          >
            {initials || "?"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                  {user.name}
                </p>
                <p className="truncate text-[12px] text-[var(--ink-soft)]">
                  {user.email}
                </p>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
                >
                  <LogoutIcon />
                </button>
              </form>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={17} height={17} {...props}>
      <path
        d="M7.5 17.5H4a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M13 13.5 17 10l-4-3.5M17 10H7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
