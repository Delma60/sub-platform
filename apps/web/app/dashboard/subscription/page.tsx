import { getCurrentUser } from "../../lib/get-current-user";
import { getActiveSubscription, getPlan, listPlans } from "../../api/lib/data-store";
import { SubscriptionManager } from "./subscription-manager";

export default async function SubscriptionPage() {
  const user = await getCurrentUser();
  const subscription = user ? getActiveSubscription(user.id) : null;
  const currentPlan = subscription ? getPlan(subscription.planId) : null;
  const plans = listPlans();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">Subscription</p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          {subscription ? "Manage your plan" : "Choose a plan"}
        </h1>
      </div>

      <SubscriptionManager
        plans={plans}
        subscription={subscription}
        currentPlanName={currentPlan?.name ?? null}
      />
    </div>
  );
}
