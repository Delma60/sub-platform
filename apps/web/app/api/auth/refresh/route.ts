import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { findUserById } from "../../lib/store";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "../../lib/auth";
import { checkRateLimit } from "../../lib/rate-limit";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, "auth:refresh", {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!limit.ok) {
    return NextResponse.json(apiError("Too many requests", 429), {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const token = createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json(
    apiSuccess({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  );
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
