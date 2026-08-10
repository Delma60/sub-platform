import { prisma } from "./prisma";
import { withDbFallback } from "./db";
import type { Prisma } from "@prisma/client";

export type PlanId = "single" | "family" | "bulk";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  frequency: "weekly" | "biweekly" | "monthly";
  features: string[];
};

export const PLAN_ID_ORDER: PlanId[] = ["single", "family", "bulk"];

const PLAN_DEFAULTS: Plan[] = [
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

const fallbackPlans = new Map<PlanId, Plan>(
  PLAN_DEFAULTS.map((plan) => [plan.id, { ...plan }]),
);

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "payment_failed";

export type StoredSubscription = {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  nextDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  deliveryDayOfWeek: number | null;
  itemSwaps: Record<string, string>;
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
  externalReference?: string;
  providerTransactionId?: string;
  createdAt: string;
};

export type StoredProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  active?: boolean;
};

export type BoxItem = { id: string; name: string; category: string };

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
    const original = swappedToId ? CATALOG_ITEMS.find((i) => i.id === slotId)! : null;
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

const fallback = {
  subscriptions: new Map<string, StoredSubscription>(),
  addresses: new Map<string, StoredAddress>(),
  orders: new Map<string, StoredOrder>(),
  deliveries: new Map<string, StoredDelivery>(),
  payments: new Map<string, StoredPayment>(),
  products: new Map<string, StoredProduct>(),
  plans: fallbackPlans,
};

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().split("-")[0]}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function cycleDaysForPlan(plan: Plan) {
  return plan.frequency === "weekly" ? 7 : plan.frequency === "biweekly" ? 14 : 30;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nextOccurrenceOfWeekday(from: Date, dayOfWeek: number) {
  const d = new Date(from);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

function serializeSubscription(row: {
  id: string;
  userId: string;
  planId: string;
  status: string;
  nextDeliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deliveryDayOfWeek: number | null;
  itemSwaps: Prisma.JsonValue;
}): StoredSubscription {
  return {
    id: row.id,
    userId: row.userId,
    planId: row.planId as PlanId,
    status: row.status as SubscriptionStatus,
    nextDeliveryDate: row.nextDeliveryDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deliveryDayOfWeek: row.deliveryDayOfWeek,
    itemSwaps: (row.itemSwaps as Record<string, string>) ?? {},
  };
}

function serializeAddress(row: {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  isDefault: boolean;
}): StoredAddress {
  return {
    id: row.id,
    userId: row.userId,
    label: row.label,
    line1: row.line1,
    line2: row.line2 ?? undefined,
    city: row.city,
    state: row.state,
    isDefault: row.isDefault,
  };
}

function serializeOrder(row: {
  id: string;
  userId: string;
  subscriptionId: string;
  planId: string;
  status: string;
  total: number;
  createdAt: Date;
  deliveryDate: Date;
}): StoredOrder {
  return {
    id: row.id,
    userId: row.userId,
    subscriptionId: row.subscriptionId,
    planId: row.planId as PlanId,
    status: row.status as OrderStatus,
    total: row.total,
    createdAt: row.createdAt.toISOString(),
    deliveryDate: row.deliveryDate.toISOString(),
  };
}

function serializeDelivery(row: {
  id: string;
  userId: string;
  orderId: string;
  addressId: string | null;
  status: string;
  scheduledDate: Date;
  deliveredAt: Date | null;
}): StoredDelivery {
  return {
    id: row.id,
    userId: row.userId,
    orderId: row.orderId,
    addressId: row.addressId,
    status: row.status as DeliveryStatus,
    scheduledDate: row.scheduledDate.toISOString(),
    deliveredAt: row.deliveredAt ? row.deliveredAt.toISOString() : null,
  };
}

function serializePayment(row: {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  externalReference?: string | null;
  providerTransactionId?: string | null;
  createdAt: Date;
}): StoredPayment {
  return {
    id: row.id,
    userId: row.userId,
    orderId: row.orderId,
    amount: row.amount,
    status: row.status as PaymentStatus,
    method: row.method,
    externalReference: row.externalReference ?? undefined,
    providerTransactionId: row.providerTransactionId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function serializeProduct(row: {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  unit: string | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): StoredProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description ?? undefined,
    price: row.price,
    unit: row.unit ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listProducts(options?: {
  activeOnly?: boolean;
}): Promise<StoredProduct[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.product.findMany({
        where: options?.activeOnly ? { active: true } : undefined,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(serializeProduct);
    },
    () => {
      const products = Array.from(fallback.products.values());
      const filtered = options?.activeOnly ? products.filter((product) => product.active) : products;
      return filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
  );
}

export async function createProduct(input: CreateProductInput): Promise<StoredProduct> {
  const slug = input.slug ? input.slug : slugify(input.name);
  return withDbFallback(
    async () => {
      const row = await prisma.product.create({
        data: {
          id: id("prd"),
          name: input.name,
          slug,
          category: input.category,
          description: input.description ?? null,
          price: input.price,
          unit: input.unit ?? null,
          imageUrl: input.imageUrl ?? null,
          active: input.active ?? true,
        },
      });
      return serializeProduct(row);
    },
    () => {
      let uniqueSlug = slug;
      let count = 1;
      while (Array.from(fallback.products.values()).some((product) => product.slug === uniqueSlug)) {
        uniqueSlug = `${slug}-${count++}`;
      }

      const product: StoredProduct = {
        id: id("prd"),
        name: input.name,
        slug: uniqueSlug,
        category: input.category,
        description: input.description,
        price: input.price,
        unit: input.unit,
        imageUrl: input.imageUrl,
        active: input.active ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallback.products.set(product.id, product);
      return product;
    }
  );
}

export async function updateProduct(
  productId: string,
  patch: Partial<CreateProductInput>
): Promise<StoredProduct | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.product.findUnique({ where: { id: productId } });
      if (!existing) return null;

      const row = await prisma.product.update({
        where: { id: productId },
        data: {
          name: patch.name ?? existing.name,
          slug: patch.slug ?? existing.slug,
          category: patch.category ?? existing.category,
          description: patch.description ?? existing.description ?? null,
          price: patch.price ?? existing.price,
          unit: patch.unit ?? existing.unit ?? null,
          imageUrl: patch.imageUrl ?? existing.imageUrl ?? null,
          active: patch.active ?? existing.active,
        },
      });
      return serializeProduct(row);
    },
    () => {
      const product = fallback.products.get(productId);
      if (!product) return null;

      const updated: StoredProduct = {
        ...product,
        name: patch.name ?? product.name,
        slug: patch.slug ?? product.slug,
        category: patch.category ?? product.category,
        description: patch.description ?? product.description,
        price: patch.price ?? product.price,
        unit: patch.unit ?? product.unit,
        imageUrl: patch.imageUrl ?? product.imageUrl,
        active: patch.active ?? product.active,
        updatedAt: new Date().toISOString(),
      };
      fallback.products.set(productId, updated);
      return updated;
    }
  );
}

export async function deleteProduct(productId: string): Promise<boolean> {
  return withDbFallback(
    async () => {
      const existing = await prisma.product.findUnique({ where: { id: productId } });
      if (!existing) return false;
      await prisma.product.delete({ where: { id: productId } });
      return true;
    },
    () => fallback.products.delete(productId)
  );
}

function serializePlan(row: {
  id: string;
  name: string;
  price: number;
  frequency: "weekly" | "biweekly" | "monthly";
  features: string[];
}): Plan {
  return {
    id: row.id as PlanId,
    name: row.name,
    price: row.price,
    frequency: row.frequency,
    features: row.features,
  };
}

export async function listPlans(): Promise<Plan[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.plan.findMany();
      const byId = new Map(rows.map((r) => [r.id as PlanId, serializePlan(r)]));
      return PLAN_ID_ORDER.map((id) => byId.get(id)).filter((p): p is Plan => Boolean(p));
    },
    () => PLAN_ID_ORDER.map((id) => fallback.plans.get(id)).filter((p): p is Plan => Boolean(p))
  );
}

export async function getPlan(planId: string): Promise<Plan | null> {
  if (!PLAN_ID_ORDER.includes(planId as PlanId)) return null;
  return withDbFallback(
    async () => {
      const row = await prisma.plan.findUnique({ where: { id: planId as PlanId } });
      return row ? serializePlan(row) : null;
    },
    () => fallback.plans.get(planId as PlanId) ?? null
  );
}

export async function updatePlan(
  planId: PlanId,
  patch: Partial<Pick<Plan, "name" | "price" | "frequency" | "features">>,
): Promise<Plan | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.plan.findUnique({ where: { id: planId } });
      if (!existing) return null;
      const row = await prisma.plan.update({
        where: { id: planId },
        data: {
          name: patch.name ?? existing.name,
          price: patch.price ?? existing.price,
          frequency: patch.frequency ?? existing.frequency,
          features: patch.features ?? existing.features,
        },
      });
      return serializePlan(row);
    },
    () => {
      const existing = fallback.plans.get(planId);
      if (!existing) return null;
      const updated: Plan = { ...existing, ...patch };
      fallback.plans.set(planId, updated);
      return updated;
    }
  );
}

export async function listAddresses(userId: string): Promise<StoredAddress[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.address.findMany({ where: { userId } });
      return rows.map(serializeAddress);
    },
    () => Array.from(fallback.addresses.values()).filter((a) => a.userId === userId)
  );
}

export async function createAddress(
  userId: string,
  input: Omit<StoredAddress, "id" | "userId" | "isDefault"> & { isDefault?: boolean }
): Promise<StoredAddress> {
  return withDbFallback(
    async () => {
      const existingCount = await prisma.address.count({ where: { userId } });
      const isDefault = input.isDefault ?? existingCount === 0;

      const row = await prisma.$transaction(async (tx) => {
        if (isDefault) {
          await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return tx.address.create({
          data: {
            id: id("addr"),
            userId,
            label: input.label,
            line1: input.line1,
            line2: input.line2 ?? null,
            city: input.city,
            state: input.state,
            isDefault,
          },
        });
      });

      return serializeAddress(row);
    },
    () => {
      const existing = Array.from(fallback.addresses.values()).filter((a) => a.userId === userId);
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
        existing.forEach((a) => fallback.addresses.set(a.id, { ...a, isDefault: false }));
      }
      fallback.addresses.set(address.id, address);
      return address;
    }
  );
}

export async function updateAddress(
  userId: string,
  addressId: string,
  patch: Partial<Omit<StoredAddress, "id" | "userId">>
): Promise<StoredAddress | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
      if (!existing) return null;

      const row = await prisma.$transaction(async (tx) => {
        if (patch.isDefault) {
          await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return tx.address.update({
          where: { id: addressId },
          data: {
            label: patch.label,
            line1: patch.line1,
            line2: patch.line2 ?? undefined,
            city: patch.city,
            state: patch.state,
            isDefault: patch.isDefault,
          },
        });
      });

      return serializeAddress(row);
    },
    () => {
      const addr = fallback.addresses.get(addressId);
      if (!addr || addr.userId !== userId) return null;
      if (patch.isDefault) {
        Array.from(fallback.addresses.values())
          .filter((a) => a.userId === userId)
          .forEach((a) => fallback.addresses.set(a.id, { ...a, isDefault: false }));
      }
      const updated = { ...addr, ...patch };
      fallback.addresses.set(addressId, updated);
      return updated;
    }
  );
}

export async function deleteAddress(userId: string, addressId: string): Promise<boolean> {
  return withDbFallback(
    async () => {
      const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
      if (!existing) return false;

      await prisma.$transaction(async (tx) => {
        await tx.address.delete({ where: { id: addressId } });
        if (existing.isDefault) {
          const remaining = await tx.address.findFirst({ where: { userId } });
          if (remaining) {
            await tx.address.update({ where: { id: remaining.id }, data: { isDefault: true } });
          }
        }
      });

      return true;
    },
    () => {
      const addr = fallback.addresses.get(addressId);
      if (!addr || addr.userId !== userId) return false;
      fallback.addresses.delete(addressId);
      if (addr.isDefault) {
        const remaining = Array.from(fallback.addresses.values()).filter((a) => a.userId === userId);
        if (remaining.length > 0) {
          fallback.addresses.set(remaining[0].id, { ...remaining[0], isDefault: true });
        }
      }
      return true;
    }
  );
}

export async function getActiveSubscription(userId: string): Promise<StoredSubscription | null> {
  return withDbFallback(
    async () => {
      const row = await prisma.subscription.findFirst({
        where: { userId, status: { not: "cancelled" } },
      });
      return row ? serializeSubscription(row) : null;
    },
    () =>
      Array.from(fallback.subscriptions.values()).find(
        (s) => s.userId === userId && s.status !== "cancelled"
      ) ?? null
  );
}

export async function getSubscriptionById(
  userId: string,
  subscriptionId: string
): Promise<StoredSubscription | null> {
  return withDbFallback(
    async () => {
      const row = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
      return row ? serializeSubscription(row) : null;
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      return sub && sub.userId === userId ? sub : null;
    }
  );
}

export async function createSubscription(userId: string, planId: PlanId): Promise<StoredSubscription> {
  const plan = await getPlan(planId);
  if (!plan) throw new Error("Invalid plan");

  return withDbFallback(
    async () => {
      const active = await prisma.subscription.findFirst({
        where: { userId, status: { not: "cancelled" } },
      });
      if (active) throw new Error("You already have an active subscription");

      const now = new Date();
      const nextDeliveryDate = new Date(addDays(now, cycleDaysForPlan(plan)));
      const defaultAddress = await prisma.address.findFirst({ where: { userId, isDefault: true } });

      const subRow = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
          data: {
            id: id("sub"),
            userId,
            planId,
            status: "active",
            nextDeliveryDate,
            deliveryDayOfWeek: null,
            itemSwaps: {},
          },
        });

        const order = await tx.order.create({
          data: {
            id: id("ord"),
            userId,
            subscriptionId: sub.id,
            planId,
            status: "processing",
            total: plan.price,
            deliveryDate: nextDeliveryDate,
          },
        });

        await tx.delivery.create({
          data: {
            id: id("del"),
            userId,
            orderId: order.id,
            addressId: defaultAddress?.id ?? null,
            status: "scheduled",
            scheduledDate: nextDeliveryDate,
          },
        });

        await tx.payment.create({
          data: {
            id: id("pay"),
            userId,
            orderId: order.id,
            amount: plan.price,
            status: "success",
            method: "Flutterwave",
          },
        });

        return sub;
      });

      return serializeSubscription(subRow);
    },
    () => {
      const now = new Date();
      const existingActive = Array.from(fallback.subscriptions.values()).find(
        (s) => s.userId === userId && s.status !== "cancelled"
      );
      if (existingActive) throw new Error("You already have an active subscription");

      const nextDeliveryDate = addDays(now, cycleDaysForPlan(plan));

      const sub: StoredSubscription = {
        id: id("sub"),
        userId,
        planId,
        status: "active",
        nextDeliveryDate,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        deliveryDayOfWeek: null,
        itemSwaps: {},
      };
      fallback.subscriptions.set(sub.id, sub);

      const order: StoredOrder = {
        id: id("ord"),
        userId,
        subscriptionId: sub.id,
        planId,
        status: "processing",
        total: plan.price,
        createdAt: now.toISOString(),
        deliveryDate: nextDeliveryDate,
      };
      fallback.orders.set(order.id, order);

      const defaultAddress = Array.from(fallback.addresses.values()).find(
        (a) => a.userId === userId && a.isDefault
      );

      const delivery: StoredDelivery = {
        id: id("del"),
        userId,
        orderId: order.id,
        addressId: defaultAddress?.id ?? null,
        status: "scheduled",
        scheduledDate: nextDeliveryDate,
        deliveredAt: null,
      };
      fallback.deliveries.set(delivery.id, delivery);

      const payment: StoredPayment = {
        id: id("pay"),
        userId,
        orderId: order.id,
        amount: plan.price,
        status: "success",
        method: "Flutterwave",
        createdAt: now.toISOString(),
      };
      fallback.payments.set(payment.id, payment);

      return sub;
    }
  );
}

export async function updateSubscriptionStatus(
  userId: string,
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<StoredSubscription | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
      if (!existing) return null;
      const row = await prisma.subscription.update({ where: { id: subscriptionId }, data: { status } });
      return serializeSubscription(row);
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub || sub.userId !== userId) return null;
      sub.status = status;
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);
      return sub;
    }
  );
}

export async function changeSubscriptionPlan(
  userId: string,
  subscriptionId: string,
  planId: PlanId
): Promise<StoredSubscription | null> {
  const plan = await getPlan(planId);
  if (!plan) return null;

  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
      if (!existing) return null;
      const row = await prisma.subscription.update({ where: { id: subscriptionId }, data: { planId } });
      return serializeSubscription(row);
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub || sub.userId !== userId) return null;
      sub.planId = planId;
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);
      return sub;
    }
  );
}

export async function adminUpdateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<StoredSubscription | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      if (!existing) return null;
      const row = await prisma.subscription.update({ where: { id: subscriptionId }, data: { status } });
      return serializeSubscription(row);
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub) return null;
      sub.status = status;
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);
      return sub;
    }
  );
}

export async function adminChangeSubscriptionPlan(
  subscriptionId: string,
  planId: PlanId
): Promise<StoredSubscription | null> {
  const plan = await getPlan(planId);
  if (!plan) return null;

  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      if (!existing) return null;
      const row = await prisma.subscription.update({ where: { id: subscriptionId }, data: { planId } });
      return serializeSubscription(row);
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub) return null;
      sub.planId = planId;
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);
      return sub;
    }
  );
}

export async function setDeliveryDay(
  userId: string,
  subscriptionId: string,
  dayOfWeek: number
): Promise<StoredSubscription | null> {
  if (dayOfWeek < 0 || dayOfWeek > 6) return null;

  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
      if (!existing) return null;

      const row = await prisma.$transaction(async (tx) => {
        const updatedSub = await tx.subscription.update({
          where: { id: subscriptionId },
          data: { deliveryDayOfWeek: dayOfWeek },
        });

        const upcoming = await tx.delivery.findFirst({
          where: {
            userId,
            status: { notIn: ["delivered", "skipped"] },
            order: { subscriptionId },
          },
        });

        if (upcoming) {
          const newDate = nextOccurrenceOfWeekday(new Date(), dayOfWeek);
          await tx.delivery.update({ where: { id: upcoming.id }, data: { scheduledDate: newDate } });
          await tx.order.update({ where: { id: upcoming.orderId }, data: { deliveryDate: newDate } });
          return tx.subscription.update({
            where: { id: subscriptionId },
            data: { nextDeliveryDate: newDate },
          });
        }

        return updatedSub;
      });

      return serializeSubscription(row);
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub || sub.userId !== userId) return null;

      sub.deliveryDayOfWeek = dayOfWeek;
      sub.updatedAt = new Date().toISOString();

      const relatedOrderIds = new Set(
        Array.from(fallback.orders.values())
          .filter((o) => o.subscriptionId === sub.id)
          .map((o) => o.id)
      );
      const upcoming = Array.from(fallback.deliveries.values()).find(
        (d) => relatedOrderIds.has(d.orderId) && d.status !== "delivered" && d.status !== "skipped"
      );

      if (upcoming) {
        const newDate = nextOccurrenceOfWeekday(new Date(), dayOfWeek).toISOString();
        upcoming.scheduledDate = newDate;
        fallback.deliveries.set(upcoming.id, upcoming);
        sub.nextDeliveryDate = newDate;

        const order = fallback.orders.get(upcoming.orderId);
        if (order) {
          order.deliveryDate = newDate;
          fallback.orders.set(order.id, order);
        }
      }

      fallback.subscriptions.set(sub.id, sub);
      return sub;
    }
  );
}

export async function swapBoxItem(
  userId: string,
  subscriptionId: string,
  fromItemId: string,
  toItemId: string
): Promise<{ subscription: StoredSubscription } | { error: string }> {
  const validate = (sub: StoredSubscription) => {
    const baseIds = PLAN_ITEM_IDS[sub.planId];
    if (!baseIds.includes(fromItemId)) return "That item isn't part of your box";
    if (!CATALOG_ITEMS.some((i) => i.id === toItemId)) return "Unknown replacement item";
    if (baseIds.includes(toItemId) && toItemId !== fromItemId) return "That item is already in your box";

    const swapLimit = PLAN_SWAP_LIMITS[sub.planId];
    const alreadySwapping = fromItemId in sub.itemSwaps;
    if (swapLimit === 0) return "Item swaps aren't available on your plan";
    if (!alreadySwapping && swapLimit !== null) {
      const swapsUsed = Object.keys(sub.itemSwaps).length;
      if (swapsUsed >= swapLimit) return `Your plan allows up to ${swapLimit} swaps per box`;
    }
    return null;
  };

  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
      if (!existing) return { error: "Subscription not found" };
      const sub = serializeSubscription(existing);

      const error = validate(sub);
      if (error) return { error };

      const itemSwaps = { ...sub.itemSwaps, [fromItemId]: toItemId };
      const row = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { itemSwaps },
      });
      return { subscription: serializeSubscription(row) };
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub || sub.userId !== userId) return { error: "Subscription not found" };

      const error = validate(sub);
      if (error) return { error };

      sub.itemSwaps = { ...sub.itemSwaps, [fromItemId]: toItemId };
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);
      return { subscription: sub };
    }
  );
}

export async function resetBoxItem(
  userId: string,
  subscriptionId: string,
  itemId: string
): Promise<StoredSubscription | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId } });
      if (!existing) return null;
      const sub = serializeSubscription(existing);
      const rest = { ...sub.itemSwaps };
      delete rest[itemId];
      const row = await prisma.subscription.update({ where: { id: subscriptionId }, data: { itemSwaps: rest } });
      return serializeSubscription(row);
    },
    () => {
      const sub = fallback.subscriptions.get(subscriptionId);
      if (!sub || sub.userId !== userId) return null;
      const rest = { ...sub.itemSwaps };
      delete rest[itemId];
      sub.itemSwaps = rest;
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);
      return sub;
    }
  );
}

export async function listOrders(userId: string): Promise<StoredOrder[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(serializeOrder);
    },
    () =>
      Array.from(fallback.orders.values())
        .filter((o) => o.userId === userId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
}

export async function getOrderById(
  userId: string,
  orderId: string
): Promise<StoredOrder | null> {
  return withDbFallback(
    async () => {
      const row = await prisma.order.findFirst({ where: { id: orderId, userId } });
      return row ? serializeOrder(row) : null;
    },
    () => {
      const order = fallback.orders.get(orderId);
      return order && order.userId === userId ? order : null;
    }
  );
}

export async function createPendingPayment(
  userId: string,
  orderId: string,
  externalReference: string
): Promise<{ order: StoredOrder; payment: StoredPayment } | { error: string }> {
  return withDbFallback(
    async () => {
      const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
      if (!order) return { error: "Order not found" };

      const row = await prisma.payment.upsert({
        where: { externalReference },
        update: {
          amount: order.total,
          status: "pending",
          method: "Flutterwave",
        },
        create: {
          id: id("pay"),
          userId,
          orderId: order.id,
          amount: order.total,
          status: "pending",
          method: "Flutterwave",
          externalReference,
        },
      });

      return { order: serializeOrder(order), payment: serializePayment(row) };
    },
    () => {
      const order = fallback.orders.get(orderId);
      if (!order || order.userId !== userId) return { error: "Order not found" };

      const existing = Array.from(fallback.payments.values()).find(
        (payment) => payment.externalReference === externalReference
      );

      const payment: StoredPayment = {
        ...(existing ?? {
          id: id("pay"),
          userId,
          orderId,
          createdAt: new Date().toISOString(),
        }),
        amount: order.total,
        status: "pending",
        method: "Flutterwave",
        externalReference,
      };
      fallback.payments.set(payment.id, payment);

      return { order, payment };
    }
  );
}

export async function finalizePaymentByReference(
  externalReference: string,
  status: PaymentStatus,
  providerTransactionId?: string
): Promise<{ payment: StoredPayment; subscription?: StoredSubscription | null } | null> {
  return withDbFallback(
    async () => {
      const payment = await prisma.payment.findUnique({
        where: { externalReference },
        include: { order: true },
      });
      if (!payment) return null;

      const updatedPayment = await prisma.$transaction(async (tx) => {
        const row = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status,
            providerTransactionId,
          },
        });

        if (status === "failed") {
          await tx.subscription.update({
            where: { id: payment.order.subscriptionId },
            data: { status: "payment_failed" },
          });
        }

        if (status === "success") {
          await tx.subscription.update({
            where: { id: payment.order.subscriptionId },
            data: { status: "active" },
          });
        }

        return row;
      });

      const subscription = await prisma.subscription.findUnique({
        where: { id: payment.order.subscriptionId },
      });

      return {
        payment: serializePayment(updatedPayment),
        subscription: subscription ? serializeSubscription(subscription) : null,
      };
    },
    () => {
      const payment = Array.from(fallback.payments.values()).find(
        (item) => item.externalReference === externalReference
      );
      if (!payment) return null;

      const updatedPayment = {
        ...payment,
        status,
        providerTransactionId,
      };
      fallback.payments.set(payment.id, updatedPayment);

      const order = fallback.orders.get(payment.orderId);
      const subscription = order ? fallback.subscriptions.get(order.subscriptionId) : null;
      if (subscription) {
        subscription.status = status === "failed" ? "payment_failed" : "active";
        subscription.updatedAt = new Date().toISOString();
        fallback.subscriptions.set(subscription.id, subscription);
      }

      return { payment: updatedPayment, subscription: subscription ?? null };
    }
  );
}

export async function generateDueSubscriptionOrders(now = new Date()) {
  return withDbFallback(
    async () => {
      const dueSubscriptions = await prisma.subscription.findMany({
        where: {
          status: "active",
          nextDeliveryDate: { lte: now },
        },
      });

      const generated = [];

      for (const subscription of dueSubscriptions) {
        const plan = await getPlan(subscription.planId);
        if (!plan) continue;

        const cycleDays = cycleDaysForPlan(plan);
        const nextDeliveryDate =
          subscription.deliveryDayOfWeek != null
            ? nextOccurrenceOfWeekday(now, subscription.deliveryDayOfWeek)
            : new Date(addDays(now, cycleDays));
        const defaultAddress = await prisma.address.findFirst({
          where: { userId: subscription.userId, isDefault: true },
        });

        const result = await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              id: id("ord"),
              userId: subscription.userId,
              subscriptionId: subscription.id,
              planId: subscription.planId,
              status: "processing",
              total: plan.price,
              deliveryDate: nextDeliveryDate,
            },
          });

          const delivery = await tx.delivery.create({
            data: {
              id: id("del"),
              userId: subscription.userId,
              orderId: order.id,
              addressId: defaultAddress?.id ?? null,
              status: "scheduled",
              scheduledDate: nextDeliveryDate,
            },
          });

          await tx.payment.create({
            data: {
              id: id("pay"),
              userId: subscription.userId,
              orderId: order.id,
              amount: plan.price,
              status: "pending",
              method: "Flutterwave",
            },
          });

          await tx.subscription.update({
            where: { id: subscription.id },
            data: { nextDeliveryDate },
          });

          return { order, delivery };
        });

        generated.push({
          order: serializeOrder(result.order),
          delivery: serializeDelivery(result.delivery),
        });
      }

      return generated;
    },
    async () => {
      const generated = [];
      const dueSubscriptions = Array.from(fallback.subscriptions.values()).filter(
        (subscription) =>
          subscription.status === "active" &&
          new Date(subscription.nextDeliveryDate).getTime() <= now.getTime()
      );

      for (const subscription of dueSubscriptions) {
        const plan = await getPlan(subscription.planId);
        if (!plan) continue;

        const cycleDays = cycleDaysForPlan(plan);
        const nextDeliveryDate =
          subscription.deliveryDayOfWeek != null
            ? nextOccurrenceOfWeekday(now, subscription.deliveryDayOfWeek).toISOString()
            : addDays(now, cycleDays);
        const defaultAddress = Array.from(fallback.addresses.values()).find(
          (address) => address.userId === subscription.userId && address.isDefault
        );

        const order: StoredOrder = {
          id: id("ord"),
          userId: subscription.userId,
          subscriptionId: subscription.id,
          planId: subscription.planId,
          status: "processing",
          total: plan.price,
          createdAt: now.toISOString(),
          deliveryDate: nextDeliveryDate,
        };
        fallback.orders.set(order.id, order);

        const delivery: StoredDelivery = {
          id: id("del"),
          userId: subscription.userId,
          orderId: order.id,
          addressId: defaultAddress?.id ?? null,
          status: "scheduled",
          scheduledDate: nextDeliveryDate,
          deliveredAt: null,
        };
        fallback.deliveries.set(delivery.id, delivery);

        const paymentId = id("pay");
        fallback.payments.set(paymentId, {
          id: paymentId,
          userId: subscription.userId,
          orderId: order.id,
          amount: plan.price,
          status: "pending",
          method: "Flutterwave",
          createdAt: now.toISOString(),
        });

        subscription.nextDeliveryDate = nextDeliveryDate;
        subscription.updatedAt = now.toISOString();
        fallback.subscriptions.set(subscription.id, subscription);

        generated.push({ order, delivery });
      }

      return generated;
    }
  );
}

export async function listDeliveries(userId: string): Promise<StoredDelivery[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.delivery.findMany({
        where: { userId },
        orderBy: { scheduledDate: "desc" },
      });
      return rows.map(serializeDelivery);
    },
    () =>
      Array.from(fallback.deliveries.values())
        .filter((d) => d.userId === userId)
        .sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1))
  );
}

export async function skipDelivery(
  userId: string,
  deliveryId: string
): Promise<{ delivery: StoredDelivery } | { error: string }> {
  return withDbFallback(
    async () => {
      const delivery = await prisma.delivery.findFirst({ where: { id: deliveryId, userId } });
      if (!delivery) return { error: "Delivery not found" };
      if (delivery.status === "delivered" || delivery.status === "skipped") {
        return { error: "This delivery can't be skipped" };
      }

      const order = await prisma.order.findUnique({ where: { id: delivery.orderId } });
      const sub = order ? await prisma.subscription.findUnique({ where: { id: order.subscriptionId } }) : null;
      if (!order || !sub) return { error: "Could not find the related subscription" };

      const plan = await getPlan(sub.planId);
      if (!plan) return { error: "Unable to resolve the plan for this subscription" };
      const cycleDays = cycleDaysForPlan(plan);
      const nextDate =
        sub.deliveryDayOfWeek != null
          ? nextOccurrenceOfWeekday(delivery.scheduledDate, sub.deliveryDayOfWeek)
          : new Date(addDays(delivery.scheduledDate, cycleDays));

      const newDeliveryRow = await prisma.$transaction(async (tx) => {
        await tx.delivery.update({ where: { id: deliveryId }, data: { status: "skipped" } });

        const newOrder = await tx.order.create({
          data: {
            id: id("ord"),
            userId,
            subscriptionId: sub.id,
            planId: sub.planId,
            status: "processing",
            total: plan.price,
            deliveryDate: nextDate,
          },
        });

        const newDelivery = await tx.delivery.create({
          data: {
            id: id("del"),
            userId,
            orderId: newOrder.id,
            addressId: delivery.addressId,
            status: "scheduled",
            scheduledDate: nextDate,
          },
        });

        await tx.subscription.update({ where: { id: sub.id }, data: { nextDeliveryDate: nextDate } });

        return newDelivery;
      });

      return { delivery: serializeDelivery(newDeliveryRow) };
    },
    async () => {
      const delivery = fallback.deliveries.get(deliveryId);
      if (!delivery || delivery.userId !== userId) return { error: "Delivery not found" };
      if (delivery.status === "delivered" || delivery.status === "skipped") {
        return { error: "This delivery can't be skipped" };
      }

      const order = fallback.orders.get(delivery.orderId);
      const sub = order ? fallback.subscriptions.get(order.subscriptionId) : null;
      if (!order || !sub) return { error: "Could not find the related subscription" };

      delivery.status = "skipped";
      fallback.deliveries.set(delivery.id, delivery);

      const plan = await getPlan(sub.planId);
      if (!plan) return { error: "Could not find the related plan" };
      const cycleDays = cycleDaysForPlan(plan);
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
      fallback.orders.set(newOrder.id, newOrder);

      const newDelivery: StoredDelivery = {
        id: id("del"),
        userId,
        orderId: newOrder.id,
        addressId: delivery.addressId,
        status: "scheduled",
        scheduledDate: nextDate,
        deliveredAt: null,
      };
      fallback.deliveries.set(newDelivery.id, newDelivery);

      sub.nextDeliveryDate = nextDate;
      sub.updatedAt = new Date().toISOString();
      fallback.subscriptions.set(sub.id, sub);

      return { delivery: newDelivery };
    }
  );
}

export async function listPayments(userId: string): Promise<StoredPayment[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(serializePayment);
    },
    () =>
      Array.from(fallback.payments.values())
        .filter((p) => p.userId === userId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
}

export function monthlyEquivalentRevenue(plan: Plan) {
  return plan.price * (30 / cycleDaysForPlan(plan));
}

export async function listAllSubscriptions(): Promise<StoredSubscription[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.subscription.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map(serializeSubscription);
    },
    () =>
      Array.from(fallback.subscriptions.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      )
  );
}

export async function listAllOrders(): Promise<StoredOrder[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map(serializeOrder);
    },
    () =>
      Array.from(fallback.orders.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      )
  );
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<StoredOrder | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.order.findUnique({ where: { id: orderId } });
      if (!existing) return null;
      const row = await prisma.order.update({ where: { id: orderId }, data: { status } });
      return serializeOrder(row);
    },
    () => {
      const order = fallback.orders.get(orderId);
      if (!order) return null;
      order.status = status;
      fallback.orders.set(order.id, order);
      return order;
    }
  );
}

export async function listAllPayments(): Promise<StoredPayment[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map(serializePayment);
    },
    () =>
      Array.from(fallback.payments.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      )
  );
}

export async function listAllDeliveries(): Promise<StoredDelivery[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.delivery.findMany({ orderBy: { scheduledDate: "desc" } });
      return rows.map(serializeDelivery);
    },
    () =>
      Array.from(fallback.deliveries.values()).sort((a, b) =>
        a.scheduledDate < b.scheduledDate ? 1 : -1
      )
  );
}

export async function listAllAddresses(): Promise<StoredAddress[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.address.findMany();
      return rows.map(serializeAddress);
    },
    () => Array.from(fallback.addresses.values())
  );
}

export async function adminUpdateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus
): Promise<StoredDelivery | null> {
  return withDbFallback(
    async () => {
      const existing = await prisma.delivery.findUnique({ where: { id: deliveryId } });
      if (!existing) return null;
      const row = await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status,
          deliveredAt: status === "delivered" ? new Date() : existing.deliveredAt,
        },
      });
      return serializeDelivery(row);
    },
    () => {
      const delivery = fallback.deliveries.get(deliveryId);
      if (!delivery) return null;
      delivery.status = status;
      if (status === "delivered") delivery.deliveredAt = new Date().toISOString();
      fallback.deliveries.set(delivery.id, delivery);
      return delivery;
    }
  );
}
