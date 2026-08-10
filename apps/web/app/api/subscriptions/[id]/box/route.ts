import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireUser } from "../../../lib/require-user";
import { swapBoxItemSchema, resetBoxItemSchema } from "../../../lib/validation";
import {
  getBoxForSubscription,
  getSubscriptionById,
  getSwapCatalog,
  resetBoxItem,
  swapBoxItem,
} from "../../../lib/data-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const sub = getSubscriptionById(user.id, params.id);
  if (!sub) return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });

  return NextResponse.json(
    apiSuccess({ box: getBoxForSubscription(sub), catalog: getSwapCatalog(sub.planId) })
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);

  if (body?.action === "reset") {
    const parsed = resetBoxItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
        { status: 422 }
      );
    }
    const sub = resetBoxItem(user.id, params.id, parsed.data.itemId);
    if (!sub) return NextResponse.json(apiError("Subscription not found", 404), { status: 404 });
    return NextResponse.json(apiSuccess({ box: getBoxForSubscription(sub) }));
  }

  const parsed = swapBoxItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const result = swapBoxItem(user.id, params.id, parsed.data.fromItemId, parsed.data.toItemId);
  if ("error" in result) {
    return NextResponse.json(apiError(result.error, 422), { status: 422 });
  }
  return NextResponse.json(apiSuccess({ box: getBoxForSubscription(result.subscription) }));
}
