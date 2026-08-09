import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { findUserById } from "../../lib/store";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);

  if (!session) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const user = findUserById(session.sub);
  if (!user) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  return NextResponse.json(
    apiSuccess({ user: { id: user.id, name: user.name, email: user.email } })
  );
}
