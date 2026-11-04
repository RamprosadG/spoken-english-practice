import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { AIVEN_CA_PEM } from "@/lib/aiven-ca";
import {
  getDatabaseUrl,
  isDevelopmentRuntime,
  isProductionRuntime,
} from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildDatabasePoolOptions(rawUrl: string) {
  const separatorIndex = rawUrl.indexOf("?");
  if (separatorIndex === -1) {
    return { connectionString: rawUrl };
  }

  const base = rawUrl.slice(0, separatorIndex);
  const kept: string[] = [];
  let sslRequested = false;
  let sslMode = "";

  for (const pair of rawUrl.slice(separatorIndex + 1).split("&")) {
    const separator = pair.indexOf("=");
    const key = separator === -1 ? pair : pair.slice(0, separator);
    if (key === "sslmode" || key === "sslrootcert") {
      sslRequested = true;
      if (key === "sslmode") {
        sslMode = decodeURIComponent(pair.slice(key.length + 1));
      }
      continue;
    }
    kept.push(pair);
  }

  const connectionString = kept.length > 0 ? `${base}?${kept.join("&")}` : base;
  if (!sslRequested || sslMode === "disable") {
    return { connectionString };
  }

  return {
    connectionString,
    ssl: {
      ca: AIVEN_CA_PEM,
      rejectUnauthorized: true,
      checkServerIdentity: () => undefined,
    },
  };
}

// The Aiven instance caps `max_connections` at 20 and every page opens several
// reads through `Promise.all`, so the driver default of 10 connections per pool
// lets one Home render take half the server and Postgres answers the rest with
// "sorry, too many clients already". A small cap makes extra reads queue here
// instead, and idle sockets are dropped quickly so a dev-server restart cannot
// keep holding slots.
const adapter = new PrismaPg({
  ...buildDatabasePoolOptions(getDatabaseUrl()),
  max: 4,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 10_000,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isDevelopmentRuntime() ? ["query", "error", "warn"] : ["error"],
  });

if (!isProductionRuntime()) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
