import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireAdmin } from "../../lib/require-admin";
import { generateDueSubscriptionOrders } from "../../lib/data-store";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const suppliedSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (cronSecret && suppliedSecret !== cronSecret) {
    return NextResponse.json(apiError("Forbidden", 403), { status: 403 });
  }

  if (!cronSecret) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json(apiError("Admin access required", 403), { status: 403 });
  }

  const generated = await generateDueSubscriptionOrders();
  return NextResponse.json(apiSuccess({ generated, count: generated.length }));
}
