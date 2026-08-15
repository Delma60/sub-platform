import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { adminDeliveryMutationSchema } from "../../../lib/validation";
import { adminAssignDeliveryRider, adminUpdateDeliveryStatus } from "../../../lib/data-store";
import { findUserById } from "../../../lib/store";
import { notifyDeliveryStatusUpdated } from "../../../lib/notifications";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminDeliveryMutationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  if (parsed.data.riderId) {
    const rider = await findUserById(parsed.data.riderId);
    if (!rider || rider.role !== "rider" || !rider.active) {
      return NextResponse.json(apiError("Choose an active rider", 422), { status: 422 });
    }
  }

  let delivery = parsed.data.riderId !== undefined
    ? await adminAssignDeliveryRider(params.id, parsed.data.riderId)
    : null;
  if (parsed.data.status !== undefined) {
    delivery = await adminUpdateDeliveryStatus(params.id, parsed.data.status);
  }
  if (!delivery) {
    return NextResponse.json(apiError("Delivery not found", 404), { status: 404 });
  }
  await notifyDeliveryStatusUpdated(delivery).catch((error) => {
    console.error("Delivery status notification failed:", error);
  });
  return NextResponse.json(apiSuccess({ delivery }));
}
