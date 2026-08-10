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

export const subscribeSchema = z.object({
  planId: z.enum(["single", "family", "bulk"]),
});

export const subscriptionActionSchema = z.object({
  action: z.enum(["pause", "resume", "cancel", "change_plan", "set_delivery_day"]),
  planId: z.enum(["single", "family", "bulk"]).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
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

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});
