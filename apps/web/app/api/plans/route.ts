import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../lib/response";
import { createPlan, listPlans } from "../lib/data-store";
import { requireAdmin } from "../lib/require-admin";
import { planCreateSchema } from "../lib/validation";

export async function GET() {
  const plans = await listPlans();
  return NextResponse.json(apiSuccess({ plans }));
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  const parsed = planCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422), { status: 422 });
  try {
    return NextResponse.json(apiSuccess({ plan: await createPlan(parsed.data) }), { status: 201 });
  } catch (error) {
    return NextResponse.json(apiError(error instanceof Error ? error.message : "Could not create plan", 409), { status: 409 });
  }
}
