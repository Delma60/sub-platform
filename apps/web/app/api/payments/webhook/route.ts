import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { finalizePaymentByReference } from "../../lib/data-store";
import { verifyFlutterwaveWebhook } from "../../lib/flutterwave";
import { notifyPaymentUpdated } from "../../lib/notifications";
import { flutterwaveWebhookSchema } from "../../lib/validation";

export async function POST(request: NextRequest) {
  if (!verifyFlutterwaveWebhook(request.headers.get("verif-hash"))) {
    return NextResponse.json(apiError("Invalid webhook signature", 401), { status: 401 });
  }

  const parsed = flutterwaveWebhookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid webhook payload", 422),
      { status: 422 },
    );
  }
  const payload = parsed.data;
  const txRef = payload?.data?.tx_ref ?? payload?.tx_ref;
  const providerStatus = payload?.data?.status ?? payload?.status;
  const providerTransactionId = payload?.data?.id ? String(payload.data.id) : undefined;

  const status = providerStatus === "successful" || providerStatus === "success" ? "success" : "failed";
  const result = await finalizePaymentByReference(txRef, status, providerTransactionId);

  if (!result) {
    return NextResponse.json(apiError("Payment reference not found", 404), { status: 404 });
  }

  await notifyPaymentUpdated(result.payment).catch((error) => {
    console.error("Payment notification failed:", error);
  });

  return NextResponse.json(apiSuccess(result));
}
