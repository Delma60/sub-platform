import type {
  NotificationStatus,
  NotificationType,
  Plan,
  StoredDelivery,
  StoredOrder,
  StoredPayment,
  StoredSubscription,
} from "./data-store";
import {
  createNotification,
  getNotificationPreferences,
  getOrderById,
  getPlan,
} from "./data-store";
import { findUserById } from "./store";

type NotificationCategory = "order" | "payment" | "delivery";

type ProviderResult = {
  status: NotificationStatus;
  error?: string;
};

type NotifyInput = {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  emailSubject?: string;
  emailBody?: string;
  smsBody?: string;
  metadata?: Record<string, string>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function preferenceAllows(category: NotificationCategory, preference: Awaited<ReturnType<typeof getNotificationPreferences>>) {
  if (category === "order") return preference.orderUpdates;
  if (category === "payment") return preference.paymentUpdates;
  return preference.deliveryReminders;
}

async function sendEmail(to: string, subject: string, text: string): Promise<ProviderResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { status: "skipped", error: "RESEND_API_KEY or RESEND_FROM_EMAIL is not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return {
        status: "failed",
        error: payload?.message ?? `Resend responded with ${response.status}`,
      };
    }

    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Email provider request failed",
    };
  }
}

async function sendSms(to: string | null | undefined, text: string): Promise<ProviderResult> {
  const apiKey = process.env.TERMII_API_KEY;
  const baseUrl = process.env.TERMII_BASE_URL;
  const senderId = process.env.TERMII_SENDER_ID;

  if (!to) {
    return { status: "skipped", error: "User phone number is not set" };
  }

  if (!apiKey || !baseUrl || !senderId) {
    return {
      status: "skipped",
      error: "TERMII_API_KEY, TERMII_BASE_URL, or TERMII_SENDER_ID is not configured",
    };
  }

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to,
        from: senderId,
        sms: text,
        type: "plain",
        channel: process.env.TERMII_CHANNEL ?? "generic",
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return {
        status: "failed",
        error: payload?.message ?? `SMS provider responded with ${response.status}`,
      };
    }

    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "SMS provider request failed",
    };
  }
}

export async function notifyUser(input: NotifyInput) {
  const [user, preference] = await Promise.all([
    findUserById(input.userId),
    getNotificationPreferences(input.userId),
  ]);

  if (!user || !preferenceAllows(input.category, preference)) return [];

  const records = [];

  if (preference.inAppEnabled) {
    records.push(
      await createNotification({
        userId: input.userId,
        type: input.type,
        channel: "in_app",
        status: "sent",
        title: input.title,
        body: input.body,
        metadata: input.metadata,
      })
    );
  }

  if (preference.emailEnabled) {
    const result = await sendEmail(
      user.email,
      input.emailSubject ?? input.title,
      input.emailBody ?? input.body
    );
    records.push(
      await createNotification({
        userId: input.userId,
        type: input.type,
        channel: "email",
        status: result.status,
        title: input.emailSubject ?? input.title,
        body: input.emailBody ?? input.body,
        metadata: input.metadata,
        error: result.error,
      })
    );
  }

  if (preference.smsEnabled) {
    const result = await sendSms(user.phone, input.smsBody ?? input.body);
    records.push(
      await createNotification({
        userId: input.userId,
        type: input.type,
        channel: "sms",
        status: result.status,
        title: input.title,
        body: input.smsBody ?? input.body,
        metadata: input.metadata,
        error: result.error,
      })
    );
  }

  return records;
}

export async function notifySubscriptionCreated(subscription: StoredSubscription, plan: Plan) {
  const deliveryDate = formatDate(subscription.nextDeliveryDate);
  return notifyUser({
    userId: subscription.userId,
    type: "order_confirmation",
    category: "order",
    title: "Subscription confirmed",
    body: `Your ${plan.name} box is active. First delivery is scheduled for ${deliveryDate}.`,
    emailSubject: "Your Oja subscription is active",
    emailBody: `Thanks for subscribing to the ${plan.name} plan. Your first delivery is scheduled for ${deliveryDate}.`,
    smsBody: `Oja: Your ${plan.name} subscription is active. First delivery: ${deliveryDate}.`,
    metadata: {
      subscriptionId: subscription.id,
      planId: subscription.planId,
    },
  });
}

export async function notifyOrderGenerated(order: StoredOrder, delivery: StoredDelivery, plan: Plan) {
  const deliveryDate = formatDate(delivery.scheduledDate);
  return notifyUser({
    userId: order.userId,
    type: "order_confirmation",
    category: "order",
    title: "New box order created",
    body: `Your ${plan.name} box has been created for ${deliveryDate}.`,
    emailSubject: "Your next Oja box is scheduled",
    emailBody: `Your ${plan.name} box order is ready in the system. Delivery date: ${deliveryDate}.`,
    smsBody: `Oja: Your next ${plan.name} box is scheduled for ${deliveryDate}.`,
    metadata: {
      orderId: order.id,
      deliveryId: delivery.id,
      planId: order.planId,
    },
  });
}

export async function notifyPaymentUpdated(payment: StoredPayment) {
  const order = await getOrderById(payment.userId, payment.orderId);
  const success = payment.status === "success";
  const amount = formatCurrency(payment.amount);

  return notifyUser({
    userId: payment.userId,
    type: success ? "payment_success" : "payment_failed",
    category: "payment",
    title: success ? "Payment received" : "Payment failed",
    body: success
      ? `We received your ${amount} payment for order ${payment.orderId}.`
      : `Your ${amount} payment for order ${payment.orderId} did not go through.`,
    emailSubject: success ? "Oja payment receipt" : "Oja payment failed",
    emailBody: success
      ? `Payment received: ${amount}\nOrder: ${payment.orderId}`
      : `Payment failed: ${amount}\nOrder: ${payment.orderId}\nPlease retry from your payments page.`,
    smsBody: success
      ? `Oja: Payment received for ${amount}.`
      : `Oja: Payment failed for ${amount}. Please retry from your account.`,
    metadata: {
      paymentId: payment.id,
      orderId: payment.orderId,
      planId: order?.planId ?? "",
    },
  });
}

export async function notifyDeliveryStatusUpdated(delivery: StoredDelivery) {
  const label = delivery.status.replace(/_/g, " ");
  return notifyUser({
    userId: delivery.userId,
    type: "delivery_status",
    category: "delivery",
    title: "Delivery status updated",
    body: `Your delivery is now ${label}.`,
    emailSubject: "Oja delivery update",
    emailBody: `Delivery ${delivery.id} is now ${label}.`,
    smsBody: `Oja: Your delivery is now ${label}.`,
    metadata: {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      status: delivery.status,
    },
  });
}

export async function notifyDeliveryReminder(delivery: StoredDelivery) {
  const deliveryDate = formatDate(delivery.scheduledDate);
  return notifyUser({
    userId: delivery.userId,
    type: "delivery_reminder",
    category: "delivery",
    title: "Delivery reminder",
    body: `Your Oja delivery is scheduled for ${deliveryDate}.`,
    emailSubject: "Your Oja delivery is coming up",
    emailBody: `Reminder: your Oja delivery is scheduled for ${deliveryDate}.`,
    smsBody: `Oja reminder: your delivery is scheduled for ${deliveryDate}.`,
    metadata: {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
    },
  });
}

export async function resolvePlan(planId: string) {
  return getPlan(planId);
}
