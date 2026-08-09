export type PlanId = "single" | "family" | "bulk";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  frequency: "weekly" | "biweekly" | "monthly";
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "single",
    name: "Single",
    price: 15000,
    frequency: "monthly",
    features: ["6–8 staple items", "Monthly delivery", "Pause anytime"],
  },
  {
    id: "family",
    name: "Family",
    price: 28000,
    frequency: "biweekly",
    features: [
      "14–16 staple items",
      "Weekly or bi-weekly delivery",
      "Swap up to 3 items",
      "Priority delivery slots",
    ],
  },
  {
    id: "bulk",
    name: "Bulk",
    price: 45000,
    frequency: "weekly",
    features: [
      "25+ items, larger quantities",
      "Weekly delivery",
      "Full item customization",
      "Dedicated support line",
    ],
  },
];

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type StoredSubscription = {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  nextDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredAddress = {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  isDefault: boolean;
};

export type OrderStatus = "processing" | "packed" | "out_for_delivery" | "delivered";

export type StoredOrder = {
  id: string;
  userId: string;
  subscriptionId: string;
  planId: PlanId;
  status: OrderStatus;
  total: number;
  createdAt: string;
  deliveryDate: string;
};

export type DeliveryStatus = "scheduled" | "out_for_delivery" | "delivered" | "issue";

export type StoredDelivery = {
  id: string;
  userId: string;
  orderId: string;
  addressId: string | null;
  status: DeliveryStatus;
  scheduledDate: string;
  deliveredAt: string | null;
};

export type PaymentStatus = "success" | "failed" | "pending";

export type StoredPayment = {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  createdAt: string;
};

const subscriptions = new Map<string, StoredSubscription>();
const addresses = new Map<string, StoredAddress>();
const orders = new Map<string, StoredOrder>();
const deliveries = new Map<string, StoredDelivery>();
const payments = new Map<string, StoredPayment>();

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().split("-")[0]}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ---- Plans ----
export function listPlans() {
  return PLANS;
}

export function getPlan(planId: string) {
  return PLANS.find((p) => p.id === planId) ?? null;
}

// ---- Subscriptions ----
export function getActiveSubscription(userId: string) {
  return (
    Array.from(subscriptions.values()).find(
      (s) => s.userId === userId && s.status !== "cancelled"
    ) ?? null
  );
}

export function createSubscription(userId: string, planId: PlanId) {
  const plan = getPlan(planId);
  if (!plan) throw new Error("Invalid plan");

  if (getActiveSubscription(userId)) {
    throw new Error("You already have an active subscription");
  }

  const now = new Date();
  const cycleDays =
    plan.frequency === "weekly" ? 7 : plan.frequency === "biweekly" ? 14 : 30;

  const sub: StoredSubscription = {
    id: id("sub"),
    userId,
    planId,
    status: "active",
    nextDeliveryDate: addDays(now, cycleDays),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  subscriptions.set(sub.id, sub);

  const order: StoredOrder = {
    id: id("ord"),
    userId,
    subscriptionId: sub.id,
    planId,
    status: "processing",
    total: plan.price,
    createdAt: now.toISOString(),
    deliveryDate: sub.nextDeliveryDate,
  };
  orders.set(order.id, order);

  const defaultAddress = listAddresses(userId).find((a) => a.isDefault);

  const delivery: StoredDelivery = {
    id: id("del"),
    userId,
    orderId: order.id,
    addressId: defaultAddress?.id ?? null,
    status: "scheduled",
    scheduledDate: sub.nextDeliveryDate,
    deliveredAt: null,
  };
  deliveries.set(delivery.id, delivery);

  const payment: StoredPayment = {
    id: id("pay"),
    userId,
    orderId: order.id,
    amount: plan.price,
    status: "success",
    method: "Flutterwave",
    createdAt: now.toISOString(),
  };
  payments.set(payment.id, payment);

  return sub;
}

export function updateSubscriptionStatus(
  userId: string,
  subscriptionId: string,
  status: SubscriptionStatus
) {
  const sub = subscriptions.get(subscriptionId);
  if (!sub || sub.userId !== userId) return null;
  sub.status = status;
  sub.updatedAt = new Date().toISOString();
  subscriptions.set(sub.id, sub);
  return sub;
}

export function changeSubscriptionPlan(
  userId: string,
  subscriptionId: string,
  planId: PlanId
) {
  const sub = subscriptions.get(subscriptionId);
  const plan = getPlan(planId);
  if (!sub || sub.userId !== userId || !plan) return null;
  sub.planId = planId;
  sub.updatedAt = new Date().toISOString();
  subscriptions.set(sub.id, sub);
  return sub;
}

// ---- Addresses ----
export function listAddresses(userId: string) {
  return Array.from(addresses.values()).filter((a) => a.userId === userId);
}

export function createAddress(
  userId: string,
  input: Omit<StoredAddress, "id" | "userId" | "isDefault"> & {
    isDefault?: boolean;
  }
) {
  const existing = listAddresses(userId);
  const address: StoredAddress = {
    id: id("addr"),
    userId,
    label: input.label,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    state: input.state,
    isDefault: input.isDefault ?? existing.length === 0,
  };

  if (address.isDefault) {
    existing.forEach((a) =>
      addresses.set(a.id, { ...a, isDefault: false })
    );
  }

  addresses.set(address.id, address);
  return address;
}

export function updateAddress(
  userId: string,
  addressId: string,
  patch: Partial<Omit<StoredAddress, "id" | "userId">>
) {
  const addr = addresses.get(addressId);
  if (!addr || addr.userId !== userId) return null;

  if (patch.isDefault) {
    listAddresses(userId).forEach((a) =>
      addresses.set(a.id, { ...a, isDefault: false })
    );
  }

  const updated = { ...addr, ...patch };
  addresses.set(addressId, updated);
  return updated;
}

export function deleteAddress(userId: string, addressId: string) {
  const addr = addresses.get(addressId);
  if (!addr || addr.userId !== userId) return false;
  addresses.delete(addressId);
  return true;
}

// ---- Orders ----
export function listOrders(userId: string) {
  return Array.from(orders.values())
    .filter((o) => o.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// ---- Deliveries ----
export function listDeliveries(userId: string) {
  return Array.from(deliveries.values())
    .filter((d) => d.userId === userId)
    .sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1));
}

// ---- Payments ----
export function listPayments(userId: string) {
  return Array.from(payments.values())
    .filter((p) => p.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
