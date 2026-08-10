import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { subscriptionActionSchema } from "../../lib/validation";
import { changeSubscriptionPlan, updateSubscriptionStatus, setDeliveryDay } from "../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

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

  const { action, planId, dayOfWeek } = parsed.data;

  if (action === "change_plan") {
    if (!planId) {
      return NextResponse.json(apiError("planId is required", 422), { status: 422 });
    }
    const updated = await changeSubscriptionPlan(user.id, id, planId);
    if (!updated) return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });
    return NextResponse.json(apiSuccess({ subscription: updated }));
  }

  if (action === "set_delivery_day") {
    if (dayOfWeek === undefined) {
      return NextResponse.json(apiError("dayOfWeek is required", 422), { status: 422 });
    }
    const updated = await setDeliveryDay(user.id, id, dayOfWeek);
    if (!updated) return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });
    return NextResponse.json(apiSuccess({ subscription: updated }));
  }

  const status = action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled";
  const updated = await updateSubscriptionStatus(user.id, id, status);
  if (!updated) return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });
  return NextResponse.json(apiSuccess({ subscription: updated }));
}
