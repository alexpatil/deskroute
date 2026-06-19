// features/organization/organization.service.ts
import prisma from "@/lib/prisma";
import { trialEndDate } from "@/lib/trial";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type {
  CreateOrganizationForUserRequest,
  CreateOrganizationRequest,
  Organization,
  OrganizationWithOwner,
  UpdateOrganizationRequest,
} from "./organization.types";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

function toOrg(org: any): Organization {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug ?? null,
    industry: org.industry ?? null,
    plan: org.plan ?? "FREE",
    ownerUserId: org.ownerUserId,
    isActive: org.isActive ?? true,
    trialEndsAt: org.trialEndsAt ?? null,
    bypassTrial: org.bypassTrial ?? false,
    createdAt: org.createdAt,
  };
}

export const organizationService = {
  async create(data: CreateOrganizationRequest): Promise<OrganizationWithOwner> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.ownerEmail } });
    if (existingUser) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);
    const slug = generateSlug(data.name);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          industry: data.industry ?? null,
          ownerUserId: "temp",
          trialEndsAt: trialEndDate(),
        },
      });

      const owner = await tx.user.create({
        data: {
          name: data.ownerEmail,
          email: data.ownerEmail,
          emailVerified: false,
          role: "ADMIN",
          organizationId: organization.id,
        },
      });

      await tx.account.create({
        data: {
          id: randomUUID(),
          accountId: owner.id,
          providerId: "credential",
          userId: owner.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await tx.organization.update({
        where: { id: organization.id },
        data: { ownerUserId: owner.id },
      });

      await tx.fileStatus.createMany({
        data: [
          { name: "Pending", organizationId: organization.id, isEnabled: true },
          { name: "In Progress", organizationId: organization.id, isEnabled: true },
          { name: "Completed", organizationId: organization.id, isEnabled: true },
        ],
      });

      return { organization, owner };
    });

    return {
      ...toOrg(result.organization),
      owner: {
        id: result.owner.id,
        email: result.owner.email,
      },
    };
  },

  // Self-service onboarding: an existing, signed-in user creates their own
  // organization and automatically becomes its Owner with full permissions.
  async createForUser(
    userId: string,
    data: CreateOrganizationForUserRequest,
  ): Promise<Organization> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (user.role === "SYSTEM_ADMIN") throw new Error("System admins cannot own an organization");
    if (user.organizationId) throw new Error("You already belong to an organization");

    const slug = generateSlug(data.name);

    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          industry: data.type ?? null,
          ownerUserId: userId,
          trialEndsAt: trialEndDate(),
          settings: {
            logoUrl: data.logoUrl ?? null,
            primaryContact: data.primaryContact ?? null,
            country: data.country ?? null,
            timezone: data.timezone ?? null,
          },
        },
      });

      // The creator becomes the Owner (ADMIN role) with all permissions granted.
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: org.id,
          role: "ADMIN",
          canViewAllFiles: true,
          canManageOffices: true,
          canManageStaff: true,
          canConfigureStatuses: true,
          canManageLocations: true,
        },
      });

      // Seed a default status workflow so the dashboard is usable immediately.
      await tx.fileStatus.createMany({
        data: [
          { name: "Pending", organizationId: org.id, isEnabled: true },
          { name: "In Progress", organizationId: org.id, isEnabled: true },
          { name: "Completed", organizationId: org.id, isEnabled: true },
        ],
      });

      return org;
    });

    return toOrg(organization);
  },

  async update(organizationId: string, data: UpdateOrganizationRequest): Promise<Organization> {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.industry !== undefined && { industry: data.industry }),
      },
    });

    return toOrg(organization);
  },

  async list(): Promise<OrganizationWithOwner[]> {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
    });

    const results = await Promise.all(
      organizations.map(async (org) => {
        const owner = await prisma.user.findUnique({
          where: { id: org.ownerUserId },
          select: { id: true, email: true },
        });

        return {
          ...toOrg(org),
          owner: owner || { id: "", email: "Unknown" },
        };
      }),
    );

    return results;
  },

  async getById(organizationId: string): Promise<OrganizationWithOwner | null> {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) return null;

    const owner = await prisma.user.findUnique({
      where: { id: organization.ownerUserId },
      select: { id: true, email: true },
    });

    return {
      ...toOrg(organization),
      owner: owner || { id: "", email: "Unknown" },
    };
  },

  async getByUserId(userId: string): Promise<Organization | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user?.organization) return null;

    return toOrg(user.organization);
  },

  async delete(organizationId: string): Promise<void> {
    await prisma.organization.delete({ where: { id: organizationId } });
  },
};
