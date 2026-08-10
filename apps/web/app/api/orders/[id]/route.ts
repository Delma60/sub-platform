import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { getOrderById, listDeliveries, listPayments } from "../../lib/data-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const order = await getOrderById(user.id, params.id);
  if (!order) return NextResponse.json(apiError("Order not found", 404), { status: 404 });

  const [deliveries, payments] = await Promise.all([
    listDeliveries(user.id),
    listPayments(user.id),
  ]);

  return NextResponse.json(
    apiSuccess({
      order,
      deliveries: deliveries.filter((delivery) => delivery.orderId === order.id),
      payments: payments.filter((payment) => payment.orderId === order.id),
    })
  );
}
