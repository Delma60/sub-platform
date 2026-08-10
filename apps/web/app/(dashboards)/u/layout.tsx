import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/get-current-user";
import { getActiveSubscription, listDeliveries } from "../../api/lib/data-store";
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

  const subscription = await getActiveSubscription(user.id);
  const deliveries = await listDeliveries(user.id);
  const nextDelivery = subscription
    ? deliveries.find((d) => d.status !== "delivered")
    : undefined;

  const nextDeliveryInfo = nextDelivery
    ? {
        dayIndex: (new Date(nextDelivery.scheduledDate).getDay() + 6) % 7,
        dateLabel: new Date(nextDelivery.scheduledDate).toLocaleDateString(
          "en-NG",
          { month: "short", day: "numeric" },
        ),
      }
    : null;

  return (
    <div className="flex min-h-screen bg-[var(--paper)] md:flex-row">
      <DashboardSidebar
        user={{ name: user.name, email: user.email, role: user.role }}
        nextDelivery={nextDeliveryInfo}
      />
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
