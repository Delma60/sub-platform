import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { skipDelivery } from "../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  if (body?.action !== "skip") {
    return NextResponse.json(apiError("Unsupported action", 422), { status: 422 });
  }

  const result = skipDelivery(user.id, params.id);
  if ("error" in result) {
    return NextResponse.json(apiError(result.error, 422), { status: 422 });
  }
  return NextResponse.json(apiSuccess({ delivery: result.delivery }));
}
