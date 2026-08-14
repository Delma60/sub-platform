import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { skipDelivery } from "../../lib/data-store";
import { customerDeliveryActionSchema } from "../../lib/validation";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = customerDeliveryActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 },
    );
  }

  const result = await skipDelivery(user.id, params.id);
  if ("error" in result) {
    return NextResponse.json(apiError(result.error, 422), { status: 422 });
  }
  return NextResponse.json(apiSuccess({ delivery: result.delivery }));
}
