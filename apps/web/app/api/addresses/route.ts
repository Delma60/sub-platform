import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../lib/response";
import { requireUser } from "../lib/require-user";
import { addressSchema } from "../lib/validation";
import { createAddress, listAddresses } from "../lib/data-store";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  return NextResponse.json(apiSuccess({ addresses: listAddresses(user.id) }));
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const address = createAddress(user.id, parsed.data);
  return NextResponse.json(apiSuccess({ address }), { status: 201 });
}
