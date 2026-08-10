import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { resetPasswordSchema } from "../../lib/validation";
import { consumePasswordResetToken, updateUser } from "../../lib/store";
import { hashPassword } from "../../lib/auth";
import { checkRateLimit } from "../../lib/rate-limit";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, "auth:reset-password", {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) {
    return NextResponse.json(apiError("Too many requests", 429), {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const user = await consumePasswordResetToken(parsed.data.token);
  if (!user) {
    return NextResponse.json(apiError("Invalid or expired reset token", 422), { status: 422 });
  }

  await updateUser(user.id, { passwordHash: hashPassword(parsed.data.password) });
  return NextResponse.json(apiSuccess({ message: "Password updated" }));
}
