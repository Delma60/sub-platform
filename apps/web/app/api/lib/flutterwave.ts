import { createHmac, timingSafeEqual } from "crypto";

export type FlutterwaveInitInput = {
  amount: number;
  currency?: string;
  txRef: string;
  redirectUrl?: string;
  customer: {
    email: string;
    name: string;
  };
  meta?: Record<string, string>;
};

export async function initializeFlutterwavePayment(input: FlutterwaveInitInput) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return {
      mode: "test_unconfigured" as const,
      paymentLink: `/u/payments?tx_ref=${encodeURIComponent(input.txRef)}`,
      txRef: input.txRef,
    };
  }

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency ?? "NGN",
      redirect_url: input.redirectUrl,
      customer: input.customer,
      customizations: {
        title: "Foodstuff Subscription",
        description: "Foodstuff order payment",
      },
      meta: input.meta,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.status !== "success") {
    throw new Error(payload?.message ?? "Could not initialize Flutterwave payment");
  }

  return {
    mode: "flutterwave" as const,
    paymentLink: payload.data?.link as string,
    txRef: input.txRef,
  };
}

export function verifyFlutterwaveWebhook(signature: string | null) {
  const hash = process.env.FLW_WEBHOOK_HASH;
  if (!hash) return process.env.NODE_ENV !== "production";
  if (!signature) return false;

  const expected = Buffer.from(hash);
  const supplied = Buffer.from(signature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function signWebhookDebugPayload(payload: string) {
  const secret = process.env.FLW_WEBHOOK_HASH;
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("hex");
}
