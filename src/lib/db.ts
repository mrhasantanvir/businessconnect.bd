import { PrismaClient } from "@prisma/client";

console.log(">>> [BusinessConnect] DB CORE v5 - Lock Bypass Restoration Active.");

const globalForPrisma = global as unknown as { db: PrismaClient };

export const db =
  globalForPrisma.db ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;

export const prisma = db;
