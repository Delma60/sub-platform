import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { loginSchema } from "../../lib/validation";
import { findUserByEmail, hasAdminUser, updateUser } from "../../lib/store";
import {
  createSessionToken,
  verifyPassword,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json(apiError(message, 422), { status: 422 });
    }

    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(apiError("Invalid email or password", 401), {
        status: 401,
      });
    }

    const adminSeedEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
    if (
      adminSeedEmail &&
      email.toLowerCase() === adminSeedEmail &&
      !(await hasAdminUser()) &&
      user.role !== "admin"
    ) {
      await updateUser(user.id, { role: "admin" });
      user.role = "admin";
    }

    const token = createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      apiSuccess({ user: { id: user.id, name: user.name, email: user.email } })
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
    console.error("Login route error:", error);
    return NextResponse.json(apiError("Something went wrong", 500), {
      status: 500,
    });
  }
}
