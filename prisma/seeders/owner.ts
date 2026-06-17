import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const DEFAULT_PASSWORD = "Pass@2020";

export async function seedOwnerUser(prisma: PrismaClient) {
  console.log("👤 Seeding system admin user...");

  const existing = await prisma.user.findUnique({ where: { email: "admin@pathya.com" } });
  if (existing) {
    console.log("✅ System admin already exists, skipping");
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@pathya.com",
      emailVerified: true,
      role: "SYSTEM_ADMIN",
    },
  });

  // Create Better Auth credential account
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✅ System admin seeded — email: admin@pathya.com / password: ${DEFAULT_PASSWORD}`);
}
