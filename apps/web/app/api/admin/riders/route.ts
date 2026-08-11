import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireAdmin } from "../../lib/require-admin";
import { hashPassword } from "../../lib/auth";
import { adminCreateRiderSchema } from "../../lib/validation";
import { createUser, findUserByEmail, listUsers, type StoredUser } from "../../lib/store";

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

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const riders = await listUsers("rider");
  return NextResponse.json(apiSuccess({ riders: riders.map(serializeRider) }));
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminCreateRiderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const { name, email, phone, password, active } = parsed.data;
  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      apiError("An account with this email already exists", 409),
      { status: 409 }
    );
  }

  const rider = await createUser({
    name,
    email,
    phone: phone === "" ? null : phone,
    passwordHash: hashPassword(password),
    role: "rider",
    active: active ?? true,
  });

  return NextResponse.json(apiSuccess({ rider: serializeRider(rider) }), {
    status: 201,
  });
}
