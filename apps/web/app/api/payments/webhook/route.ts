import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { finalizePaymentByReference } from "../../lib/data-store";
import { verifyFlutterwaveWebhook } from "../../lib/flutterwave";

export async function POST(request: NextRequest) {
  if (!verifyFlutterwaveWebhook(request.headers.get("verif-hash"))) {
    return NextResponse.json(apiError("Invalid webhook signature", 401), { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const txRef = payload?.data?.tx_ref ?? payload?.tx_ref;
  const providerStatus = payload?.data?.status ?? payload?.status;
  const providerTransactionId = payload?.data?.id ? String(payload.data.id) : undefined;

  if (!txRef) {
    return NextResponse.json(apiError("Missing transaction reference", 422), { status: 422 });
  }

  const status = providerStatus === "successful" || providerStatus === "success" ? "success" : "failed";
  const result = await finalizePaymentByReference(txRef, status, providerTransactionId);

  if (!result) {
    return NextResponse.json(apiError("Payment reference not found", 404), { status: 404 });
  }

  return NextResponse.json(apiSuccess(result));
}
