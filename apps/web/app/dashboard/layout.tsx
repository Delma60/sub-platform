import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/get-current-user";
import { DashboardSidebar } from "./components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-[var(--paper)] md:flex-row">
      <DashboardSidebar user={{ name: user.name, email: user.email }} />
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
