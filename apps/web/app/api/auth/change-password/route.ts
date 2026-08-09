import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { changePasswordSchema } from "../../lib/validation";
import { findUserById, updateUser } from "../../lib/store";
import { SESSION_COOKIE_NAME, verifySessionToken, verifyPassword, hashPassword } from "../../lib/auth";

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);

  if (!session) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json(
      apiError("Current password is incorrect", 401),
      { status: 401 }
    );
  }

  if (newPassword === currentPassword) {
    return NextResponse.json(
      apiError("New password must differ from your current one", 422),
      { status: 422 }
    );
  }

  await updateUser(user.id, { passwordHash: hashPassword(newPassword) });

  return NextResponse.json(apiSuccess({ updated: true }));
}
