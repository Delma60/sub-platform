import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Add it to apps/web/.env.local (see instructions.md §4)."
    );
  }
  return secret;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, 64);
  return (
    hashBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(hashBuffer, suppliedBuffer)
  );
}

type SessionPayload = {
  sub: string;
  email: string;
  role: "customer" | "admin" | "rider";
  exp: number;
};

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(
  token: string | undefined | null
): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    );
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}
