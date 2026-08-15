import { redirect } from "next/navigation";

export default async function CheckoutResultPage({ searchParams }: { searchParams: Promise<{ status?: string; orderId?: string }> }) {
  const { status, orderId } = await searchParams;
  const destination = status === "successful" || status === "completed" ? "/checkout/success" : "/checkout/failure";
  redirect(orderId ? `${destination}?orderId=${encodeURIComponent(orderId)}` : destination);
}
