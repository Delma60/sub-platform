import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/get-current-user";
import {
  getActiveSubscription,
  getBoxForSubscription,
  getSwapCatalog,
} from "../../../api/lib/data-store";
import { BoxManager } from "./box-manager";

export default async function BoxPage() {
  const user = await getCurrentUser();
  const subscription = user ? await getActiveSubscription(user.id) : null;

  if (!subscription) redirect("/dashboard/subscription");

  const box = getBoxForSubscription(subscription);
  const catalog = getSwapCatalog(subscription.planId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Subscription
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Customize your box
        </h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          {box.swapLimit === 0
            ? "Item swaps aren't available on the Single plan — upgrade to Family or Bulk."
            : box.swapLimit === null
              ? "Swap any item, as often as you like."
              : `Swap up to ${box.swapLimit} items per box.`}
        </p>
      </div>

      <BoxManager
        subscriptionId={subscription.id}
        initialBox={box}
        catalog={catalog}
      />
    </div>
  );
}
