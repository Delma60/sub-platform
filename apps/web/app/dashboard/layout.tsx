import { DashboardSidebar } from "./components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = { name: "Adaeze Okafor", email: "adaeze@example.com" };

  return (
    <div className="flex min-h-screen bg-[#FAF6EF] md:flex-row">
      <DashboardSidebar user={user} />
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
