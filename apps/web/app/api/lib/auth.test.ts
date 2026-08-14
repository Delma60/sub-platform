import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  createRefreshToken,
  createSessionToken,
  verifyRefreshToken,
  verifySessionToken,
} from "./auth";

const identity = {
  sub: "user-1",
  email: "user@example.com",
  role: "customer" as const,
};

describe("authentication tokens", () => {
  beforeEach(() => {
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret-that-is-long-enough");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("keeps access and refresh credentials separate", () => {
    const access = createSessionToken(identity);
    const refresh = createRefreshToken(identity);

    expect(verifySessionToken(access)?.sub).toBe(identity.sub);
    expect(verifyRefreshToken(refresh)?.sub).toBe(identity.sub);
    expect(verifySessionToken(refresh)).toBeNull();
    expect(verifyRefreshToken(access)).toBeNull();
  });

  it("rejects tampered signatures", () => {
    const token = createSessionToken(identity);
    expect(verifySessionToken(`${token.slice(0, -1)}x`)).toBeNull();
  });

  it("expires access tokens after fifteen minutes", () => {
    const token = createSessionToken(identity);
    vi.advanceTimersByTime((ACCESS_TOKEN_MAX_AGE_SECONDS + 1) * 1000);
    expect(verifySessionToken(token)).toBeNull();
  });
});
