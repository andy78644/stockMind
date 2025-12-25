import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isLibsql = (process.env.DATABASE_URL || "").startsWith("libsql") || (process.env.DATABASE_URL || "").startsWith("file:");

let prismaInstance: PrismaClient;

if (isLibsql) {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  prismaInstance = new PrismaClient({ adapter });
} else {
  // Direct connection for Postgres (Supabase), MySQL, etc.
  prismaInstance = new PrismaClient();
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
