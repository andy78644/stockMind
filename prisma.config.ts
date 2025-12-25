import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env.DATABASE_URL || "file:./dev.db",
        // @ts-ignore - Prisma 7 might require this in config but types might not be updated yet
        directUrl: process.env.DIRECT_URL,
    },
});
