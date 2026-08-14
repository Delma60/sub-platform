import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "session";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_MAX_AGE_SECONDS = ACCESS_TOKEN_MAX_AGE_SECONDS;

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
  type?: "access" | "refresh";
};

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createToken(
  payload: Omit<SessionPayload, "exp" | "type">,
  type: "access" | "refresh",
  maxAgeSeconds: number,
) {
  const body: SessionPayload = {
    ...payload,
    type,
    exp: Date.now() + maxAgeSeconds * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function createSessionToken(payload: Omit<SessionPayload, "exp" | "type">) {
  return createToken(payload, "access", ACCESS_TOKEN_MAX_AGE_SECONDS);
}

export function createRefreshToken(payload: Omit<SessionPayload, "exp" | "type">) {
  return createToken(payload, "refresh", REFRESH_TOKEN_MAX_AGE_SECONDS);
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
    return payload.exp > Date.now() && payload.type !== "refresh" ? payload : null;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    return payload.type === "refresh" && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}
