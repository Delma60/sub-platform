import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { initiatePaymentSchema } from "../../lib/validation";
import { createPendingPayment } from "../../lib/data-store";
import { initializeFlutterwavePayment } from "../../lib/flutterwave";

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = initiatePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const txRef = `fs-${parsed.data.orderId}-${randomUUID()}`;
  const result = await createPendingPayment(user.id, parsed.data.orderId, txRef);
  if ("error" in result) {
    return NextResponse.json(apiError(result.error, 404), { status: 404 });
  }

  const origin = request.nextUrl.origin;
  const checkout = await initializeFlutterwavePayment({
    amount: result.order.total,
    txRef,
    redirectUrl: `${origin}/checkout/result`,
    customer: {
      email: user.email,
      name: user.name,
    },
    meta: {
      orderId: result.order.id,
      userId: user.id,
    },
  });

  return NextResponse.json(apiSuccess({ checkout, payment: result.payment }));
}
