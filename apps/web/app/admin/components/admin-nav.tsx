import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/deliveries", label: "Deliveries" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
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
