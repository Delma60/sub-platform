import { describe, expect, it } from "vitest";
import { canTransitionSubscription } from "./data-store";

describe("subscription state transitions", () => {
  it.each([
    ["active", "paused"],
    ["active", "cancelled"],
    ["paused", "active"],
    ["paused", "cancelled"],
    ["payment_failed", "active"],
    ["payment_failed", "cancelled"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransitionSubscription(from, to)).toBe(true);
  });

  it.each([
    ["cancelled", "active"],
    ["cancelled", "paused"],
    ["payment_failed", "paused"],
    ["paused", "payment_failed"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransitionSubscription(from, to)).toBe(false);
  });

  it("treats repeated webhook/status updates as idempotent", () => {
    expect(canTransitionSubscription("active", "active")).toBe(true);
    expect(canTransitionSubscription("cancelled", "cancelled")).toBe(true);
  });
});
