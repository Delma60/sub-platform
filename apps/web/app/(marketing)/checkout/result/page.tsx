import { redirect } from "next/navigation";

export default async function CheckoutResultPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  redirect(status === "successful" || status === "completed" ? "/checkout/success" : "/checkout/failure");
}
