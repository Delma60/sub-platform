import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../lib/response";
import { requireUser } from "../lib/require-user";
import { listOrders } from "../lib/data-store";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  const orders = await listOrders(user.id);
  return NextResponse.json(apiSuccess({ orders }));
}
