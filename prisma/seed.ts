import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedOwnerUser } from "./seeders/owner";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

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
    console.log("📊 Database connection closed");
  }
}

main();
