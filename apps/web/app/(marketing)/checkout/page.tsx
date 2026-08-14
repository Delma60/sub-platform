import { listPlans } from "../../api/lib/data-store";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: requestedPlan } = await searchParams;
  return <CheckoutForm plans={await listPlans()} initialPlan={requestedPlan} />;
}
