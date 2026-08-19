import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "dns";
import * as schema from "./schema";

// IPv4 çözümlemesini zorla
dns.setDefaultResultOrder("ipv4first");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __tekreklamPool?: Pool;
};

export const pool =
  globalForDb.__tekreklamPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__tekreklamPool = pool;
}

export const db = drizzle(pool, { schema });
