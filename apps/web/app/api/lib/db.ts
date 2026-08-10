import { prisma } from "./prisma";

let dbAvailable: boolean | null = null;

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
    console.warn("Prisma query failed, falling back to in-memory store.", error);
    if (process.env.NODE_ENV !== "production") {
      dbAvailable = false;
      return await fallback();
    }
    throw error;
  }
}
