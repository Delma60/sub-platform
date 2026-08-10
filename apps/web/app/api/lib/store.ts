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

const users = new Map<string, StoredUser>();
let dbAvailable: boolean | null = null;

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

async function withDbFallback<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
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
    return user ?? null;
  }, () => users.get(normalized) ?? null);
}

export async function findUserById(id: string) {
  if (!(await isDbAvailable())) {
    return Array.from(users.values()).find((user) => user.id === id) ?? null;
  }

  return await withDbFallback(async () => {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ?? null;
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
    return prisma.user.create({
      data: {
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
      },
    });
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
  patch: Partial<Pick<StoredUser, "name" | "email" | "passwordHash">>
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
      },
    });

    return updated;
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
