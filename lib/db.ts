import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 7 requires a driver adapter for PostgreSQL
// The schema is set via search_path in the connection options
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Set the default schema via connection options
    options: `-c search_path=${process.env.DATABASE_SCHEMA || "public"}`,
});

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
