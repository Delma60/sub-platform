import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { registerSchema } from "../../lib/validation";
import { createUser, findUserByEmail, hasAdminUser } from "../../lib/store";
import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../lib/auth";
import { checkRateLimit } from "../../lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = checkRateLimit(request, "auth:register", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.ok) {
      return NextResponse.json(apiError("Too many requests", 429), {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      });
    }

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json(apiError(message, 422), { status: 422 });
    }

    const { name, email, password } = parsed.data;
    const adminSeedEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
    const isFirstAdmin =
      adminSeedEmail &&
      email.toLowerCase() === adminSeedEmail &&
      !(await hasAdminUser());
    const role = isFirstAdmin ? "admin" : "customer";

    if (await findUserByEmail(email)) {
      return NextResponse.json(
        apiError("An account with this email already exists", 409),
        { status: 409 }
      );
    }

    const user = await createUser({
      name,
      email,
      passwordHash: hashPassword(password),
      role,
    });
    const token = createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      apiSuccess({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken: token,
        expiresIn: SESSION_MAX_AGE_SECONDS,
      }),
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Register route error:", error);
    return NextResponse.json(apiError("Something went wrong", 500), {
      status: 500,
    });
  }
}
