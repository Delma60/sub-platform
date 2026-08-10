import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentRider } from "../lib/get-current-rider";

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rider = await getCurrentRider();

  if (!rider) {
    redirect("/auth/login?next=/r");
  }

  return (
    <div className="min-h-screen bg-[#F7F7F3] text-[#17251C]">
      <header className="border-b border-[#E4DCC8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/r" className="font-display text-2xl">
            Oja Rider
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[#6B6558]">
            {rider.role === "admin" && (
              <Link href="/a" className="hover:text-[#17251C]">
                Admin
              </Link>
            )}
            <form action="/api/auth/logout" method="POST">
              <button className="rounded-md border border-[#E4DCC8] px-3 py-1.5 hover:border-[#24402F]">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
