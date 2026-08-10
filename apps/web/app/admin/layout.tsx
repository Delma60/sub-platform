import Link from "next/link";
import {
  BarChart3,
  Boxes,
  CreditCard,
  Home,
  Package2,
  Settings,
  Truck,
  Users,
  RefreshCw,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { href: "/admin/orders", label: "Orders", icon: Package2 },
  { href: "/admin/deliveries", label: "Deliveries", icon: Truck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className="lg:w-64">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin Panel
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Operations Hub
              </h2>
            </div>

            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
