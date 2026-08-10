import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { notificationPreferenceSchema } from "../../lib/validation";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../lib/data-store";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const preferences = await getNotificationPreferences(user.id);
  return NextResponse.json(apiSuccess({ preferences }));
}

export async function PATCH(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = notificationPreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  const preferences = await updateNotificationPreferences(user.id, parsed.data);
  return NextResponse.json(apiSuccess({ preferences }));
}
