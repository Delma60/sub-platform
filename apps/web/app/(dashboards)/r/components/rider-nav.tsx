"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/r", label: "Today" },
  { href: "/r/deliveries", label: "All deliveries" },
];

export function RiderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-[#24402F] text-white"
                : "border border-[#E4DCC8] text-[#6B6558] hover:bg-[#17251C]/[0.04]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
