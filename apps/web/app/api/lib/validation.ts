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
  action: z.enum(["pause", "resume", "cancel", "change_plan"]),
  planId: z.enum(["single", "family", "bulk"]).optional(),
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
