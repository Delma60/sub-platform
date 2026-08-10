import Link from "next/link";

const links = [
  { href: "/a", label: "Overview" },
  { href: "/a/products", label: "Products" },
  { href: "/a/subscriptions", label: "Subscriptions" },
  { href: "/a/orders", label: "Orders" },
  { href: "/a/deliveries", label: "Deliveries" },
  { href: "/a/payments", label: "Payments" },
  { href: "/a/customers", label: "Customers" },
  { href: "/a/analytics", label: "Analytics" },
  { href: "/a/settings", label: "Settings" },
];

export default function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
