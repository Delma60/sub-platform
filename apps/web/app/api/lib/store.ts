import { prisma } from "./prisma";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return user ?? null;
}

export async function findUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user ?? null;
}

export async function createUser(user: Omit<StoredUser, "id" | "createdAt">) {
  return prisma.user.create({
    data: {
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
    },
  });
}
