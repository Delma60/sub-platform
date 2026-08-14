import { prisma } from "./prisma";

let dbAvailable: boolean | null = null;

function isDatabaseConnectivityError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  return /^P10(?:0\d|1[0-7])$/.test(code);
}

export async function isDbAvailable() {
  if (dbAvailable !== null) return dbAvailable;
  if (process.env.NODE_ENV === "production") {
    dbAvailable = true;
    return dbAvailable;
  }
  try {
    await prisma.$connect();
    dbAvailable = true;
  } catch (error) {
    console.warn("Prisma database unavailable, falling back to in-memory store.", error);
    dbAvailable = false;
  }
  return dbAvailable;
}

export async function withDbFallback<T>(
  action: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && isDatabaseConnectivityError(error)) {
      console.warn("Prisma database unavailable, falling back to in-memory store.", error);
      dbAvailable = false;
      return await fallback();
    }
    throw error;
  }
}
