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
  deliveryDayOfWeek: number | null; // 0 = Sunday … 6 = Saturday
  itemSwaps: Record<string, string>; // originalItemId -> replacementItemId
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

export type DeliveryStatus =
  | "scheduled"
  | "out_for_delivery"
  | "delivered"
  | "issue"
  | "skipped";

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

// ---- Box items & customization ----
export type BoxItem = {
  id: string;
  name: string;
  category: string;
};

export const CATALOG_ITEMS: BoxItem[] = [
  { id: "tomatoes", name: "Tomatoes", category: "Vegetables" },
  { id: "pepper-mix", name: "Tatashe & rodo pepper", category: "Vegetables" },
  { id: "onions", name: "Onions", category: "Vegetables" },
  { id: "ugu", name: "Ugu & spinach", category: "Vegetables" },
  { id: "ginger-garlic", name: "Ginger & garlic", category: "Vegetables" },
  { id: "plantain", name: "Plantain", category: "Vegetables" },
  { id: "rice", name: "Rice", category: "Grains & staples" },
  { id: "beans", name: "Beans", category: "Grains & staples" },
  { id: "garri", name: "Garri", category: "Grains & staples" },
  { id: "yam", name: "Yam", category: "Grains & staples" },
  { id: "semovita", name: "Semovita", category: "Grains & staples" },
  { id: "sweet-potato", name: "Sweet potato", category: "Grains & staples" },
  { id: "palm-oil", name: "Palm oil", category: "Pantry" },
  { id: "groundnut-oil", name: "Groundnut oil", category: "Pantry" },
  { id: "coconut-oil", name: "Coconut oil", category: "Pantry" },
  { id: "crayfish", name: "Crayfish", category: "Pantry" },
  { id: "stockfish", name: "Stock fish", category: "Pantry" },
  { id: "smoked-fish", name: "Smoked fish", category: "Pantry" },
  { id: "egusi", name: "Egusi", category: "Pantry" },
  { id: "seasoning-cubes", name: "Seasoning cubes", category: "Pantry" },
];

// Default box contents per plan (matches marketing copy: 6-8 / 14-16 / 25+ items)
export const PLAN_ITEM_IDS: Record<PlanId, string[]> = {
  single: ["tomatoes", "pepper-mix", "onions", "rice", "beans", "seasoning-cubes"],
  family: [
    "tomatoes",
    "pepper-mix",
    "onions",
    "ugu",
    "ginger-garlic",
    "rice",
    "beans",
    "garri",
    "yam",
    "semovita",
    "palm-oil",
    "crayfish",
    "stockfish",
    "seasoning-cubes",
  ],
  bulk: CATALOG_ITEMS.map((item) => item.id),
};

// null = unlimited swaps (Bulk's "full customization")
export const PLAN_SWAP_LIMITS: Record<PlanId, number | null> = {
  single: 0,
  family: 3,
  bulk: null,
};

export function getSwapCatalog(planId: PlanId) {
  const baseIds = new Set(PLAN_ITEM_IDS[planId]);
  return CATALOG_ITEMS.filter((item) => !baseIds.has(item.id));
}

export function getBoxForSubscription(subscription: StoredSubscription) {
  const baseIds = PLAN_ITEM_IDS[subscription.planId];
  const slots = baseIds.map((slotId) => {
    const swappedToId = subscription.itemSwaps[slotId];
    const current = CATALOG_ITEMS.find((i) => i.id === (swappedToId ?? slotId))!;
    const original = swappedToId
      ? CATALOG_ITEMS.find((i) => i.id === slotId)!
      : null;
    return { slotId, item: current, original };
  });

  const swapsUsed = Object.keys(subscription.itemSwaps).length;
  const swapLimit = PLAN_SWAP_LIMITS[subscription.planId];

  return {
    slots,
    swapsUsed,
    swapLimit,
    swapsRemaining: swapLimit === null ? null : Math.max(0, swapLimit - swapsUsed),
  };
}

export function swapBoxItem(
  userId: string,
  subscriptionId: string,
  fromItemId: string,
  toItemId: string
) {
  const sub = subscriptions.get(subscriptionId);
  if (!sub || sub.userId !== userId) return { error: "Subscription not found" as const };

  const baseIds = PLAN_ITEM_IDS[sub.planId];
  if (!baseIds.includes(fromItemId)) {
    return { error: "That item isn't part of your box" as const };
  }
  if (!CATALOG_ITEMS.some((i) => i.id === toItemId)) {
    return { error: "Unknown replacement item" as const };
  }
  if (baseIds.includes(toItemId) && toItemId !== fromItemId) {
    return { error: "That item is already in your box" as const };
  }

  const swapLimit = PLAN_SWAP_LIMITS[sub.planId];
  const alreadySwapping = fromItemId in sub.itemSwaps;
  if (swapLimit === 0) {
    return { error: "Item swaps aren't available on your plan" as const };
  }
  if (!alreadySwapping && swapLimit !== null) {
    const swapsUsed = Object.keys(sub.itemSwaps).length;
    if (swapsUsed >= swapLimit) {
      return { error: `Your plan allows up to ${swapLimit} swaps per box` as const };
    }
  }

  sub.itemSwaps = { ...sub.itemSwaps, [fromItemId]: toItemId };
  sub.updatedAt = new Date().toISOString();
  subscriptions.set(sub.id, sub);
  return { subscription: sub };
}

export function resetBoxItem(userId: string, subscriptionId: string, itemId: string) {
  const sub = subscriptions.get(subscriptionId);
  if (!sub || sub.userId !== userId) return null;
  const { [itemId]: _removed, ...rest } = sub.itemSwaps;
  sub.itemSwaps = rest;
  sub.updatedAt = new Date().toISOString();
  subscriptions.set(sub.id, sub);
  return sub;
}

export function getSubscriptionById(userId: string, subscriptionId: string) {
  const sub = subscriptions.get(subscriptionId);
  return sub && sub.userId === userId ? sub : null;
}

function nextOccurrenceOfWeekday(from: Date, dayOfWeek: number) {
  const d = new Date(from);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

export function setDeliveryDay(userId: string, subscriptionId: string, dayOfWeek: number) {
  const sub = subscriptions.get(subscriptionId);
  if (!sub || sub.userId !== userId) return null;
  if (dayOfWeek < 0 || dayOfWeek > 6) return null;

  sub.deliveryDayOfWeek = dayOfWeek;
  sub.updatedAt = new Date().toISOString();

  const relatedOrderIds = new Set(
    Array.from(orders.values())
      .filter((o) => o.subscriptionId === sub.id)
      .map((o) => o.id)
  );
  const upcoming = Array.from(deliveries.values()).find(
    (d) => relatedOrderIds.has(d.orderId) && d.status !== "delivered" && d.status !== "skipped"
  );

  if (upcoming) {
    const newDate = nextOccurrenceOfWeekday(new Date(), dayOfWeek).toISOString();
    upcoming.scheduledDate = newDate;
    deliveries.set(upcoming.id, upcoming);
    sub.nextDeliveryDate = newDate;

    const order = orders.get(upcoming.orderId);
    if (order) {
      order.deliveryDate = newDate;
      orders.set(order.id, order);
    }
  }

  subscriptions.set(sub.id, sub);
  return sub;
}

export function skipDelivery(userId: string, deliveryId: string) {
  const delivery = deliveries.get(deliveryId);
  if (!delivery || delivery.userId !== userId) {
    return { error: "Delivery not found" as const };
  }
  if (delivery.status === "delivered" || delivery.status === "skipped") {
    return { error: "This delivery can't be skipped" as const };
  }

  const order = orders.get(delivery.orderId);
  const sub = order ? subscriptions.get(order.subscriptionId) : null;
  if (!order || !sub) return { error: "Could not find the related subscription" as const };

  delivery.status = "skipped";
  deliveries.set(delivery.id, delivery);

  const plan = getPlan(sub.planId)!;
  const cycleDays = plan.frequency === "weekly" ? 7 : plan.frequency === "biweekly" ? 14 : 30;

  const nextDate =
    sub.deliveryDayOfWeek != null
      ? nextOccurrenceOfWeekday(new Date(delivery.scheduledDate), sub.deliveryDayOfWeek).toISOString()
      : addDays(new Date(delivery.scheduledDate), cycleDays);

  const newOrder: StoredOrder = {
    id: id("ord"),
    userId,
    subscriptionId: sub.id,
    planId: sub.planId,
    status: "processing",
    total: plan.price,
    createdAt: new Date().toISOString(),
    deliveryDate: nextDate,
  };
  orders.set(newOrder.id, newOrder);

  const newDelivery: StoredDelivery = {
    id: id("del"),
    userId,
    orderId: newOrder.id,
    addressId: delivery.addressId,
    status: "scheduled",
    scheduledDate: nextDate,
    deliveredAt: null,
  };
  deliveries.set(newDelivery.id, newDelivery);

  sub.nextDeliveryDate = nextDate;
  sub.updatedAt = new Date().toISOString();
  subscriptions.set(sub.id, sub);

  return { delivery: newDelivery };
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
    deliveryDayOfWeek: null,
    itemSwaps: {},
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

  // If the deleted address was the default, promote the next remaining one
  // so the user is never left without a default silently.
  if (addr.isDefault) {
    const remaining = listAddresses(userId);
    if (remaining.length > 0) {
      addresses.set(remaining[0].id, { ...remaining[0], isDefault: true });
    }
  }

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
