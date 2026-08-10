import { redirect } from "next/navigation";
import { getCurrentAdmin } from "../lib/get-current-admin";
import { AdminSidebar } from "./components/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/auth/login?next=/a");
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F3] md:flex-row">
      <AdminSidebar admin={{ name: admin.name, email: admin.email }} />
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
