import { describe, expect, it } from "vitest";
import { canTransitionSubscription, nextCycleDeliveryDate, type Plan } from "./data-store";

describe("subscription state transitions", () => {
  it.each([
    ["active", "paused"],
    ["active", "cancelled"],
    ["paused", "active"],
    ["paused", "cancelled"],
    ["paused", "payment_failed"],
    ["payment_failed", "active"],
    ["payment_failed", "cancelled"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransitionSubscription(from, to)).toBe(true);
  });

  it.each([
    ["cancelled", "active"],
    ["cancelled", "paused"],
    ["payment_failed", "paused"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransitionSubscription(from, to)).toBe(false);
  });

  it("treats repeated webhook/status updates as idempotent", () => {
    expect(canTransitionSubscription("active", "active")).toBe(true);
    expect(canTransitionSubscription("cancelled", "cancelled")).toBe(true);
  });
});

describe("billing-cycle dates", () => {
  const plan = (frequency: Plan["frequency"]): Plan => ({
    id: "single",
    name: "Test",
    price: 100,
    frequency,
    features: ["Test"],
  });

  it.each([
    ["weekly", "2026-08-21T10:00:00.000Z"],
    ["biweekly", "2026-08-28T10:00:00.000Z"],
    ["monthly", "2026-09-13T10:00:00.000Z"],
  ] as const)("advances %s plans from the scheduled date", (frequency, expected) => {
    expect(nextCycleDeliveryDate(plan(frequency), new Date("2026-08-14T10:00:00.000Z"), null).toISOString()).toBe(expected);
  });

  it("keeps a configured weekday without using the cron execution date", () => {
    const friday = 5;
    const result = nextCycleDeliveryDate(
      plan("weekly"),
      new Date("2026-08-14T10:00:00.000Z"),
      friday,
    );
    expect(result.toISOString()).toBe("2026-08-21T10:00:00.000Z");
  });
});
