import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// Parse the URL manually so pg never calls pg-connection-string.parse(),
// which fails under pnpm's strict module isolation.
function pgConfigFromUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    ssl: u.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : undefined,
  };
}

const globalForPrisma = global as unknown as {
  pool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool(pgConfigFromUrl(process.env.DATABASE_URL!));
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    adapter: new PrismaPg(globalForPrisma.pool),
  });
}

const prisma = globalForPrisma.prisma;
export default prisma;
