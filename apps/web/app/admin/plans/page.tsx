import { listPlans } from "../../api/lib/data-store";
import { PlansManager } from "./plans-manager";

export default async function AdminPlansPage() {
  const plans = await listPlans();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">Catalog</p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Plans</h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Edit pricing, delivery frequency, and features for each subscription
          tier. Tiers themselves are fixed — item composition is managed in code.
        </p>
      </div>

      <PlansManager initialPlans={plans} />
    </div>
  );
}
