import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => bcrypt.hash(password, 10),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STAFF",
        input: false,
      },
      organizationId: {
        type: "string",
        nullable: true,
        input: false,
      },
      assignedLocationId: {
        type: "string",
        nullable: true,
        input: false,
      },
      canViewAllFiles: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      canManageOffices: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      canManageStaff: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      canConfigureStatuses: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      canManageLocations: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
