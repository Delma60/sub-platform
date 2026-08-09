import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { addressSchema } from "../../lib/validation";
import { deleteAddress, updateAddress } from "../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const { id } = params;
  const body = await request.json().catch(() => null);
  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const address = updateAddress(user.id, id, parsed.data);
  if (!address) return NextResponse.json(apiError("Address not found", 404), { status: 404 });
  return NextResponse.json(apiSuccess({ address }));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const { id } = params;
  const ok = deleteAddress(user.id, id);
  if (!ok) return NextResponse.json(apiError("Address not found", 404), { status: 404 });
  return NextResponse.json(apiSuccess({ deleted: true }));
}
