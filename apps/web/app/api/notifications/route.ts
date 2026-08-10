import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "../lib/response";
import { requireUser } from "../lib/require-user";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/data-store";

const markReadSchema = z.object({
  notificationId: z.string().min(1).optional(),
  all: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(user.id),
    countUnreadNotifications(user.id),
  ]);

  return NextResponse.json(apiSuccess({ notifications, unreadCount }));
}

export async function PATCH(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = markReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  if (parsed.data.all) {
    const count = await markAllNotificationsRead(user.id);
    return NextResponse.json(apiSuccess({ updated: count }));
  }

  if (!parsed.data.notificationId) {
    return NextResponse.json(apiError("notificationId is required", 422), { status: 422 });
  }

  const notification = await markNotificationRead(user.id, parsed.data.notificationId);
  if (!notification) {
    return NextResponse.json(apiError("Notification not found", 404), { status: 404 });
  }

  return NextResponse.json(apiSuccess({ notification }));
}
