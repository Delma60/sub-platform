import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { adminDeliveryUpdateSchema } from "../../../lib/validation";
import { adminUpdateDeliveryStatus } from "../../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminDeliveryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const delivery = await adminUpdateDeliveryStatus(params.id, parsed.data.status);
  if (!delivery) {
    return NextResponse.json(apiError("Delivery not found", 404), { status: 404 });
  }
  return NextResponse.json(apiSuccess({ delivery }));
}
