import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(24),
  password: z.string().min(8),
});

export const subscribeSchema = z.object({
  planId: z.enum(["single", "family", "bulk"]),
});

export const subscriptionActionSchema = z.object({
  action: z.enum(["pause", "resume", "cancel", "change_plan", "set_delivery_day"]),
  planId: z.enum(["single", "family", "bulk"]).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
});

export const adminDeliveryUpdateSchema = z.object({
  status: z.enum(["scheduled", "out_for_delivery", "delivered", "issue", "skipped"]),
});

export const adminOrderUpdateSchema = z.object({
  status: z.enum(["processing", "packed", "out_for_delivery", "delivered"]),
});

export const planUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().int().nonnegative().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  features: z.array(z.string().min(1)).min(1).max(12).optional(),
});

export const swapBoxItemSchema = z.object({
  fromItemId: z.string().min(1),
  toItemId: z.string().min(1),
});

export const resetBoxItemSchema = z.object({
  action: z.literal("reset"),
  itemId: z.string().min(1),
});

export const addressSchema = z.object({
  label: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  isDefault: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
    .optional(),
  category: z.string().min(2),
  description: z.string().max(500).optional(),
  price: z.number().int().nonnegative(),
  unit: z.string().max(40).optional(),
  imageUrl: z.string().url().optional(),
  active: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1),
});

export const uploadSignSchema = z.object({
  fileName: z.string().min(1).max(180),
  contentType: z.string().min(3).max(120),
  folder: z.enum(["products", "proofs", "avatars"]).optional(),
});
