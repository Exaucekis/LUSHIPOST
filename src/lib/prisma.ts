import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// En local, utiliser la connexion directe Neon (évite l'épuisement du pool PgBouncer)
const databaseUrl =
  process.env.NODE_ENV === "development" && process.env.DIRECT_URL
    ? process.env.DIRECT_URL
    : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  });

globalForPrisma.prisma = prisma;

export default prisma;
