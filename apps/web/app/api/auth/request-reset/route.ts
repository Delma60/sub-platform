import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requestPasswordResetSchema } from "../../lib/validation";
import { createPasswordResetToken } from "../../lib/store";
import { checkRateLimit } from "../../lib/rate-limit";
import { sendPasswordResetEmail } from "../../lib/notifications";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, "auth:request-reset", {
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
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const reset = await createPasswordResetToken(parsed.data.email);
  if (reset) {
    const resetUrl = new URL("/auth/reset-password", request.nextUrl.origin);
    resetUrl.searchParams.set("token", reset.token);
    const delivery = await sendPasswordResetEmail(parsed.data.email, resetUrl.toString());
    if (delivery.status === "failed") console.error("Password reset email failed:", delivery.error);
  }

  return NextResponse.json(
    apiSuccess({
      message: "If an account exists, password reset instructions will be sent.",
      devToken: process.env.NODE_ENV === "production" ? undefined : reset?.token,
      expiresAt: process.env.NODE_ENV === "production" ? undefined : reset?.expiresAt,
    })
  );
}
