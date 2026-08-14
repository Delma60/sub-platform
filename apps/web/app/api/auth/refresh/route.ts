import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { findUserById } from "../../lib/store";
import {
  createSessionToken,
  createRefreshToken,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifyRefreshToken,
} from "../../lib/auth";
import { checkRateLimit } from "../../lib/rate-limit";
import { refreshTokenSchema } from "../../lib/validation";

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

  const parsed = refreshTokenSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid refresh request", 422), { status: 422 });
  }
  const session = verifyRefreshToken(
    parsed.data.refreshToken ?? request.cookies.get(REFRESH_COOKIE_NAME)?.value,
  );
  if (!session) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const user = await findUserById(session.sub);
  if (!user || !user.active) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const token = createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = createRefreshToken({ sub: user.id, email: user.email, role: user.role });

  const response = NextResponse.json(
    apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken: token,
      refreshToken,
      expiresIn: SESSION_MAX_AGE_SECONDS,
    })
  );
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
  return response;
}
