import { describe, expect, it } from "vitest";
import {
  customerDeliveryActionSchema,
  flutterwaveWebhookSchema,
  planCreateSchema,
  riderDeliveryUpdateSchema,
} from "./validation";

describe("Phase 3 API contracts", () => {
  it("accepts only the customer skip action", () => {
    expect(customerDeliveryActionSchema.safeParse({ action: "skip" }).success).toBe(true);
    expect(customerDeliveryActionSchema.safeParse({ action: "delivered" }).success).toBe(false);
  });

  it("prevents riders from setting admin-only delivery states", () => {
    expect(riderDeliveryUpdateSchema.safeParse({ status: "delivered" }).success).toBe(true);
    expect(riderDeliveryUpdateSchema.safeParse({ status: "skipped" }).success).toBe(false);
    expect(riderDeliveryUpdateSchema.safeParse({ status: "scheduled" }).success).toBe(false);
  });

  it("validates nested and legacy Flutterwave webhook payloads", () => {
    expect(
      flutterwaveWebhookSchema.safeParse({
        data: { tx_ref: "fs-order-1", status: "successful", id: 42 },
      }).success,
    ).toBe(true);
    expect(
      flutterwaveWebhookSchema.safeParse({ tx_ref: "fs-order-1", status: "failed" }).success,
    ).toBe(true);
    expect(flutterwaveWebhookSchema.safeParse({ data: { status: "successful" } }).success).toBe(false);
  });

  it("rejects unsupported plan identifiers", () => {
    expect(
      planCreateSchema.safeParse({
        id: "enterprise",
        name: "Enterprise",
        price: 100,
        frequency: "monthly",
        features: ["Feature"],
      }).success,
    ).toBe(false);
  });
});
