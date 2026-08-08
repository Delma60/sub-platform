import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          Foodstuff Platform
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/auth/login" className="hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="rounded bg-slate-900 px-3 py-1.5 text-white"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
