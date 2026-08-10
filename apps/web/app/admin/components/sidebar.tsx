"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronIcon,
  CloseIcon,
  DeliveriesIcon,
  MenuIcon,
  OrdersIcon,
  OverviewIcon,
  PaymentsIcon,
  PlansIcon,
  ProductsIcon,
  SubscriptionsIcon,
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
      { href: "/admin", label: "Overview", icon: OverviewIcon, exact: true },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: ProductsIcon },
      { href: "/admin/plans", label: "Plans", icon: PlansIcon },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/admin/subscriptions",
        label: "Subscriptions",
        icon: SubscriptionsIcon,
      },
      { href: "/admin/orders", label: "Orders", icon: OrdersIcon },
      { href: "/admin/deliveries", label: "Deliveries", icon: DeliveriesIcon },
      { href: "/admin/payments", label: "Payments", icon: PaymentsIcon },
    ],
  },
];

export function AdminSidebar({
  admin,
}: {
  admin: { name: string; email: string };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const initials = admin.name
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
      <div className="flex items-center justify-between border-b border-[#2A2A26] bg-[#17251C] px-4 py-3 md:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold text-white"
        >
          Oja
          <span className="rounded-full bg-[#BC8A31]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#D4A94E]">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white"
        >
          <MenuIcon />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-[#2A2A26] bg-[#17251C] py-6 text-white transition-all duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-[76px]" : "w-64 md:w-64"}`}
      >
        <div
          className={`flex items-center justify-between ${collapsed ? "px-3" : "px-5"}`}
        >
          {!collapsed && (
            <Link
              href="/admin"
              className="flex items-center gap-2 text-lg font-semibold text-white"
            >
              Oja
              <span className="rounded-full bg-[#BC8A31]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#D4A94E]">
                Admin
              </span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="text-white/60 md:hidden"
          >
            <CloseIcon />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-7 w-7 items-center justify-center rounded-md text-white/50 transition hover:bg-white/5 hover:text-white md:flex"
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
                <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
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
                      className={`flex items-center gap-3 rounded-md py-2.5 text-[14px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC8A31]/40 ${
                        collapsed ? "justify-center px-0" : "px-3"
                      } ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
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

        <div className={`mb-2 ${collapsed ? "px-3" : "px-5"}`}>
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md py-2.5 text-[13px] text-white/50 transition hover:text-white"
            >
              ← Customer view
            </Link>
          )}
        </div>

        <div
          className={`flex items-center gap-3 border-t border-white/10 pt-5 ${
            collapsed ? "justify-center px-0" : "px-5"
          }`}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#BC8A31]/20 text-[13px] font-medium text-[#D4A94E]"
            title={collapsed ? admin.name : undefined}
          >
            {initials || "?"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">
                  {admin.name}
                </p>
                <p className="truncate text-[12px] text-white/50">
                  {admin.email}
                </p>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="text-white/50 transition hover:text-white"
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
