import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { subscriptionActionSchema } from "../../../lib/validation";
import {
  adminChangeSubscriptionPlan,
  adminUpdateSubscriptionStatus,
} from "../../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const params = await context.params;
  const { id } = params;
  const body = await request.json().catch(() => null);
  const parsed = subscriptionActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const { action, planId } = parsed.data;

  if (action === "change_plan") {
    if (!planId) {
      return NextResponse.json(apiError("planId is required", 422), { status: 422 });
    }
    const updated = await adminChangeSubscriptionPlan(id, planId);
    if (!updated) {
      return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });
    }
    return NextResponse.json(apiSuccess({ subscription: updated }));
  }

  if (action === "set_delivery_day") {
    return NextResponse.json(
      apiError("Delivery day can only be changed by the customer", 422),
      { status: 422 }
    );
  }

  const status = action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled";
  const updated = await adminUpdateSubscriptionStatus(id, status);
  if (!updated) {
    return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });
  }
  return NextResponse.json(apiSuccess({ subscription: updated }));
}
