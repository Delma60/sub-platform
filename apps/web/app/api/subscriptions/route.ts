import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../lib/response";
import { requireUser } from "../lib/require-user";
import { subscribeSchema } from "../lib/validation";
import { createSubscription, getActiveSubscription, getPlan } from "../lib/data-store";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const subscription = await getActiveSubscription(user.id);
  const plan = subscription ? await getPlan(subscription.planId) : null;
  return NextResponse.json(apiSuccess({ subscription, plan }));
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  try {
    const subscription = await createSubscription(user.id, parsed.data.planId);
    return NextResponse.json(apiSuccess({ subscription }), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : "Could not subscribe", 400),
      { status: 400 }
    );
  }
}
