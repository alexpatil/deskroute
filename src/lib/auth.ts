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
  // Google sign-in is enabled only when credentials are present, so the app
  // keeps working in environments where Google OAuth hasn't been configured.
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Google sends the name split as given_name / family_name — capture
            // both instead of collapsing them into a single display name.
            mapProfileToUser: (profile) => ({
              firstName: profile.given_name,
              lastName: profile.family_name,
            }),
          },
        }
      : undefined,
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
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
