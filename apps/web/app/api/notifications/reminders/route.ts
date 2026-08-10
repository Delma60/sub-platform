import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireAdmin } from "../../lib/require-admin";
import { listAllDeliveries } from "../../lib/data-store";
import { notifyDeliveryReminder } from "../../lib/notifications";

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const suppliedSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (cronSecret && suppliedSecret !== cronSecret) {
    return NextResponse.json(apiError("Forbidden", 403), { status: 403 });
  }

  if (!cronSecret) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json(apiError("Admin access required", 403), { status: 403 });
  }

  const target = new Date();
  target.setDate(target.getDate() + 1);
  const targetKey = dateKey(target);
  const deliveries = (await listAllDeliveries()).filter(
    (delivery) =>
      delivery.status === "scheduled" && dateKey(new Date(delivery.scheduledDate)) === targetKey
  );

  for (const delivery of deliveries) {
    await notifyDeliveryReminder(delivery).catch((error) => {
      console.error("Delivery reminder notification failed:", error);
    });
  }

  return NextResponse.json(apiSuccess({ count: deliveries.length, date: targetKey }));
}
