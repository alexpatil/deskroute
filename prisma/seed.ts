import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { seedOwnerUser } from "./seeders/owner";

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

const pool = new Pool(pgConfigFromUrl(process.env.DATABASE_URL!));
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function runSeed() {
  console.log("🌱 Starting database seeding...\n");
  await seedOwnerUser(prisma);
  console.log("\n🎉 Database seeding completed successfully!");
}

async function main() {
  try {
    await runSeed();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
    console.log("📊 Database connection closed");
  }
}

main();
