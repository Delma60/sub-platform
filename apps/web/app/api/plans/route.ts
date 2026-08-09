import { NextResponse } from "next/server";
import { apiSuccess } from "../lib/response";
import { listPlans } from "../lib/data-store";

export async function GET() {
  return NextResponse.json(apiSuccess({ plans: listPlans() }));
}
