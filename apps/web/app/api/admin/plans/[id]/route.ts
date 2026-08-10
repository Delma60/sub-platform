import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { planUpdateSchema } from "../../../lib/validation";
import { updatePlan, PLAN_ID_ORDER, type PlanId } from "../../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const params = await context.params;
  const { id } = params;
  if (!PLAN_ID_ORDER.includes(id as PlanId)) {
    return NextResponse.json(apiError("Unknown plan", 404), { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = planUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 },
    );
  }

  const plan = await updatePlan(id as PlanId, parsed.data);
  if (!plan) return NextResponse.json(apiError("Plan not found", 404), { status: 404 });
  return NextResponse.json(apiSuccess({ plan }));
}
