import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { findUserById, updateUser } from "../../lib/store";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth";
import { updateProfileSchema } from "../../lib/validation";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);

  if (!session) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  return NextResponse.json(
    apiSuccess({ user: { id: user.id, name: user.name, email: user.email } })
  );
}

export async function PATCH(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);

  if (!session) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const user = await updateUser(session.sub, parsed.data);
  if (!user) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  return NextResponse.json(
    apiSuccess({ user: { id: user.id, name: user.name, email: user.email } })
  );
}
