import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireRider } from "../../../lib/require-rider";
import { adminDeliveryUpdateSchema, riderDeliveryUpdateSchema } from "../../../lib/validation";
import { adminUpdateDeliveryStatus, riderUpdateDeliveryStatus, type RiderDeliveryMutation } from "../../../lib/data-store";
import { notifyDeliveryStatusUpdated } from "../../../lib/notifications";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rider = await requireRider(request);
  if (!rider) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = (rider.role === "admin" ? adminDeliveryUpdateSchema : riderDeliveryUpdateSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const delivery = rider.role === "admin"
    ? await adminUpdateDeliveryStatus(params.id, parsed.data.status)
    : await riderUpdateDeliveryStatus(params.id, rider.id, parsed.data as RiderDeliveryMutation);
  if (!delivery) {
    return NextResponse.json(apiError("Delivery not found", 404), { status: 404 });
  }

  await notifyDeliveryStatusUpdated(delivery).catch((error) => {
    console.error("Delivery status notification failed:", error);
  });

  return NextResponse.json(apiSuccess({ delivery }));
}
