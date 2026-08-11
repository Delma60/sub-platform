import { redirect } from "next/navigation";
import { getCurrentRider } from "../../lib/get-current-rider";
import { RiderSidebar } from "./components/rider-sidebar";

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
      <RiderSidebar rider={{ name: rider.name, role: rider.role }} />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
