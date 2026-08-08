// TEMPORARY in-memory store.
// TODO: replace with real persistence once Neon + Prisma/Drizzle is wired up
// (see instructions.md §3 / TODO.web.md §2). Data resets on every server
// restart or redeploy — do not rely on this beyond local dev.

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const users = new Map<string, StoredUser>(); // keyed by lowercased email

export function findUserByEmail(email: string) {
  return users.get(email.toLowerCase()) ?? null;
}

export function findUserById(id: string) {
  return Array.from(users.values()).find((user) => user.id === id) ?? null;
}

export function createUser(user: Omit<StoredUser, "id" | "createdAt">) {
  const record: StoredUser = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  users.set(user.email.toLowerCase(), record);
  return record;
}
