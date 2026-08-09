"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: OverviewIcon, exact: true },
  { href: "/dashboard/subscription", label: "Subscription", icon: BoxIcon },
  { href: "/dashboard/orders", label: "Orders", icon: OrdersIcon },
  { href: "/dashboard/deliveries", label: "Deliveries", icon: TruckIcon },
  { href: "/dashboard/addresses", label: "Addresses", icon: PinIcon },
  { href: "/dashboard/payments", label: "Payment history", icon: ReceiptIcon },
  { href: "/dashboard/settings", label: "Settings", icon: GearIcon },
];

export function DashboardSidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
      <div className="flex items-center justify-between border-b border-[#FAF6EF]/10 bg-[#FAF6EF] px-4 py-3 md:hidden">
        <Link href="/" className="font-display text-xl text-[#17251C]">
          Oja
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4DCC8] text-[#17251C]"
        >
          <MenuIcon />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#17251C]/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#17251C] px-4 py-6 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="font-display text-xl text-[#FAF6EF]">
            Oja
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-[#FAF6EF]/60 md:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="mt-9 flex flex-1 flex-col gap-0.5">
          {nav.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition ${
                  active
                    ? "bg-[#FAF6EF]/[0.06] text-[#FAF6EF]"
                    : "text-[#FAF6EF]/60 hover:bg-[#FAF6EF]/[0.04] hover:text-[#FAF6EF]/90"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full transition ${
                    active ? "bg-[#BC8A31]" : "bg-transparent"
                  }`}
                />
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-[#FAF6EF]/10 px-2 pt-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#BC8A31]/20 text-[13px] font-medium text-[#BC8A31]">
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#FAF6EF]">
              {user.name}
            </p>
            <p className="truncate text-[12px] text-[#FAF6EF]/50">
              {user.email}
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              aria-label="Sign out"
              className="text-[#FAF6EF]/40 transition hover:text-[#FAF6EF]"
            >
              <LogoutIcon />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function OverviewIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <rect
        x="2.5"
        y="2.5"
        width="6.5"
        height="6.5"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="11"
        y="2.5"
        width="6.5"
        height="9.5"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="2.5"
        y="11.5"
        width="6.5"
        height="6"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="11"
        y="14.5"
        width="6.5"
        height="3"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M2.5 6.2 10 2.5l7.5 3.7v7.6L10 17.5l-7.5-3.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M2.7 6.4 10 10l7.3-3.6M10 10v7.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function OrdersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M4 3.5h12v14l-3-1.8-3 1.8-3-1.8-3 1.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 7.5h6M7 10.5h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M2.5 5.5h8v7h-8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 8.5h3.3L16 11v1.5h-5.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="5.5"
        cy="14"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="13" cy="14" r="1.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M10 17.5S15.5 12 15.5 8a5.5 5.5 0 0 0-11 0c0 4 5.5 9.5 5.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M5 2.5h10v15l-2-1.3-1.5 1.3-1.5-1.3-1.5 1.3-1.5-1.3-2 1.3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6.5h5M7.5 9.5h5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.9 5.1l-1.1 1.1M6.2 13.7l-1.1 1.1M14.9 14.9l-1.1-1.1M6.2 6.2 5.1 5.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={18} height={18} {...props}>
      <path
        d="M3 5.5h14M3 10h14M3 14.5h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" width={18} height={18} {...props}>
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
