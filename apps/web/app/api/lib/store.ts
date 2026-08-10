import { createHash, randomBytes } from "crypto";
import { prisma } from "./prisma";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  createdAt: string;
};

export type CreateUserInput = Omit<StoredUser, "id" | "createdAt"> & {
  role?: StoredUser["role"];
};

function normalizeStoredUser(
  user: Omit<StoredUser, "createdAt"> & { createdAt: string | Date }
): StoredUser {
  return {
    ...user,
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : user.createdAt.toISOString(),
  };
}

const users = new Map<string, StoredUser>();
const passwordResetTokens = new Map<
  string,
  { userId: string; tokenHash: string; expiresAt: string; usedAt: string | null }
>();
let dbAvailable: boolean | null = null;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function isDbAvailable() {
  if (dbAvailable !== null) return dbAvailable;
  if (process.env.NODE_ENV === "production") {
    dbAvailable = true;
    return dbAvailable;
  }

  try {
    await prisma.$connect();
    dbAvailable = true;
  } catch (error) {
    console.warn("Prisma database unavailable, falling back to in-memory auth store.", error);
    dbAvailable = false;
  }
  return dbAvailable;
}

async function withDbFallback<T>(
  action: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    console.warn("Prisma query failed, falling back to in-memory auth store.", error);
    if (process.env.NODE_ENV !== "production") {
      dbAvailable = false;
      return await fallback();
    }
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  const normalized = email.toLowerCase();
  if (!(await isDbAvailable())) {
    return users.get(normalized) ?? null;
  }

  return await withDbFallback(async () => {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
    });
    return user ? normalizeStoredUser(user) : null;
  }, () => users.get(normalized) ?? null);
}

export async function hasAdminUser() {
  if (!(await isDbAvailable())) {
    return Array.from(users.values()).some((user) => user.role === "admin");
  }

  return await withDbFallback(async () => {
    const user = await prisma.user.findFirst({
      where: { role: "admin" },
    });
    return Boolean(user);
  }, () => Array.from(users.values()).some((user) => user.role === "admin"));
}

export async function findUserById(id: string) {
  if (!(await isDbAvailable())) {
    return Array.from(users.values()).find((user) => user.id === id) ?? null;
  }

  return await withDbFallback(async () => {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? normalizeStoredUser(user) : null;
  }, () => Array.from(users.values()).find((user) => user.id === id) ?? null);
}

export async function createUser(user: CreateUserInput) {
  const role = user.role ?? "customer";

  if (!(await isDbAvailable())) {
    const record: StoredUser = {
      ...user,
      role,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    users.set(user.email.toLowerCase(), record);
    return record;
  }

  return await withDbFallback(async () => {
    const record = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role,
      },
    });
    return normalizeStoredUser(record);
  }, () => {
    const record: StoredUser = {
      ...user,
      role,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    users.set(user.email.toLowerCase(), record);
    return record;
  });
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<StoredUser, "name" | "email" | "passwordHash" | "role">>
) {
  if (!(await isDbAvailable())) {
    const user = await findUserById(id);
    if (!user) return null;

    const updated: StoredUser = {
      ...user,
      ...patch,
      email: patch.email ? patch.email.toLowerCase() : user.email,
    };

    if (patch.email && patch.email.toLowerCase() !== user.email.toLowerCase()) {
      users.delete(user.email.toLowerCase());
      users.set(updated.email.toLowerCase(), updated);
    } else {
      users.set(user.email.toLowerCase(), updated);
    }

    return updated;
  }

  return await withDbFallback(async () => {
    const user = await findUserById(id);
    if (!user) return null;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: patch.name ?? user.name,
        email: patch.email ? patch.email.toLowerCase() : user.email,
        passwordHash: patch.passwordHash ?? user.passwordHash,
        role: patch.role ?? user.role,
      },
    });

    return normalizeStoredUser(updated);
  }, async () => {
    const user = await findUserById(id);
    if (!user) return null;

    const updated: StoredUser = {
      ...user,
      ...patch,
      email: patch.email ? patch.email.toLowerCase() : user.email,
    };

    if (patch.email && patch.email.toLowerCase() !== user.email.toLowerCase()) {
      users.delete(user.email.toLowerCase());
      users.set(updated.email.toLowerCase(), updated);
    } else {
      users.set(user.email.toLowerCase(), updated);
    }

    return updated;
  });
}

export async function listUsersByIds(ids: string[]) {
  const normalizedIds = Array.from(new Set(ids));

  if (!(await isDbAvailable())) {
    const matchingUsers = Array.from(users.values()).filter((user) =>
      normalizedIds.includes(user.id)
    );
    return new Map(matchingUsers.map((user) => [user.id, user]));
  }

  return await withDbFallback(async () => {
    const foundUsers = await prisma.user.findMany({
      where: { id: { in: normalizedIds } },
    });
    return new Map(foundUsers.map((user) => [user.id, normalizeStoredUser(user)]));
  }, async () => {
    const matchingUsers = Array.from(users.values()).filter((user) =>
      normalizedIds.includes(user.id)
    );
    return new Map(matchingUsers.map((user) => [user.id, user]));
  });
}

export async function countUsers(role?: StoredUser["role"]) {
  if (!(await isDbAvailable())) {
    return Array.from(users.values()).filter((user) =>
      role ? user.role === role : true
    ).length;
  }

  return await withDbFallback(async () => {
    if (role) {
      return prisma.user.count({ where: { role } });
    }
    return prisma.user.count();
  }, async () =>
    Array.from(users.values()).filter((user) =>
      role ? user.role === role : true
    ).length
  );
}

export async function createPasswordResetToken(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  if (!(await isDbAvailable())) {
    passwordResetTokens.set(tokenHash, {
      userId: user.id,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
    });
    return { token, expiresAt: expiresAt.toISOString(), user };
  }

  return await withDbFallback(
    async () => {
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
      return { token, expiresAt: expiresAt.toISOString(), user };
    },
    async () => {
      passwordResetTokens.set(tokenHash, {
        userId: user.id,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
        usedAt: null,
      });
      return { token, expiresAt: expiresAt.toISOString(), user };
    }
  );
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  if (!(await isDbAvailable())) {
    const record = passwordResetTokens.get(tokenHash);
    if (!record || record.usedAt || new Date(record.expiresAt) <= now) return null;
    passwordResetTokens.set(tokenHash, { ...record, usedAt: now.toISOString() });
    return await findUserById(record.userId);
  }

  return await withDbFallback(
    async () => {
      const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });
      if (!record || record.usedAt || record.expiresAt <= now) return null;

      await prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: now },
      });

      return await findUserById(record.userId);
    },
    async () => {
      const record = passwordResetTokens.get(tokenHash);
      if (!record || record.usedAt || new Date(record.expiresAt) <= now) return null;
      passwordResetTokens.set(tokenHash, { ...record, usedAt: now.toISOString() });
      return await findUserById(record.userId);
    }
  );
}
