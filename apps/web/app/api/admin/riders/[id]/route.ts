import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { hashPassword } from "../../../lib/auth";
import { adminUpdateRiderSchema } from "../../../lib/validation";
import {
  findUserByEmail,
  findUserById,
  updateUser,
  type StoredUser,
} from "../../../lib/store";

function serializeRider(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    active: user.active,
    createdAt: user.createdAt,
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const params = await context.params;
  const existing = await findUserById(params.id);
  if (!existing || existing.role !== "rider") {
    return NextResponse.json(apiError("Rider not found", 404), { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateRiderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  if (parsed.data.email) {
    const duplicate = await findUserByEmail(parsed.data.email);
    if (duplicate && duplicate.id !== existing.id) {
      return NextResponse.json(
        apiError("An account with this email already exists", 409),
        { status: 409 }
      );
    }
  }

  const rider = await updateUser(existing.id, {
    name: parsed.data.name,
    email: parsed.data.email,
    phone:
      parsed.data.phone === undefined
        ? undefined
        : parsed.data.phone === ""
          ? null
          : parsed.data.phone,
    passwordHash: parsed.data.password ? hashPassword(parsed.data.password) : undefined,
    active: parsed.data.active,
  });

  if (!rider) {
    return NextResponse.json(apiError("Rider not found", 404), { status: 404 });
  }

  return NextResponse.json(apiSuccess({ rider: serializeRider(rider) }));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const params = await context.params;
  const existing = await findUserById(params.id);
  if (!existing || existing.role !== "rider") {
    return NextResponse.json(apiError("Rider not found", 404), { status: 404 });
  }

  const rider = await updateUser(existing.id, { active: false });
  if (!rider) {
    return NextResponse.json(apiError("Rider not found", 404), { status: 404 });
  }

  return NextResponse.json(apiSuccess({ rider: serializeRider(rider), deleted: true }));
}
