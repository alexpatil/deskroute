import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = "Pass@2020";

export async function seedOwnerUser(prisma: PrismaClient) {
  console.log("👤 Seeding owner user...");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: "admin@pathya.com" },
    update: {},
    create: {
      email: "admin@pathya.com",
      passwordHash: hashedPassword,
      role: "SYSTEM_ADMIN",
    },
  });
  console.log("✅ Owner user seeded successfully");
}
