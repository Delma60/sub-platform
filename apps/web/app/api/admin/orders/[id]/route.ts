import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { adminOrderUpdateSchema } from "../../../lib/validation";
import { adminUpdateOrderStatus } from "../../../lib/data-store";

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
  const parsed = adminOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const order = await adminUpdateOrderStatus(params.id, parsed.data.status);
  if (!order) {
    return NextResponse.json(apiError("Order not found", 404), { status: 404 });
  }
  return NextResponse.json(apiSuccess({ order }));
}
