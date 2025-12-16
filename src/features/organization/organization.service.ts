// features/organization/organization.service.ts
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import type { CreateOrganizationRequest, Organization, OrganizationWithOwner, UpdateOrganizationRequest } from "./organization.types";

export const organizationService = {
  async create(data: CreateOrganizationRequest): Promise<OrganizationWithOwner> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.ownerEmail },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.ownerPassword, 10);

    // Create organization and owner in transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          ownerUserId: "temp", // Will be updated immediately
        },
      });

      const owner = await tx.user.create({
        data: {
          email: data.ownerEmail,
          passwordHash,
          role: "ADMIN",
          organizationId: organization.id,
        },
      });

      await tx.organization.update({
        where: { id: organization.id },
        data: { ownerUserId: owner.id },
      });

      // Create default file statuses
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
      id: result.organization.id,
      name: result.organization.name,
      ownerUserId: result.owner.id,
      isActive: true,
      createdAt: result.organization.createdAt,
      owner: {
        id: result.owner.id,
        email: result.owner.email,
      },
    };
  },

  async update(organizationId: string, data: UpdateOrganizationRequest): Promise<Organization> {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    });

    return {
      id: organization.id,
      name: organization.name,
      ownerUserId: organization.ownerUserId,
      isActive: true,
      createdAt: organization.createdAt,
    };
  },

  async list(): Promise<OrganizationWithOwner[]> {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch owner details separately for each organization
    const organizationsWithOwners = await Promise.all(
      organizations.map(async (org) => {
        const owner = await prisma.user.findUnique({
          where: { id: org.ownerUserId },
          select: { id: true, email: true },
        });

        return {
          id: org.id,
          name: org.name,
          ownerUserId: org.ownerUserId,
          isActive: true,
          createdAt: org.createdAt,
          owner: owner || { id: "", email: "Unknown" },
        };
      })
    );

    return organizationsWithOwners;
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
      id: organization.id,
      name: organization.name,
      ownerUserId: organization.ownerUserId,
      isActive: true,
      createdAt: organization.createdAt,
      owner: owner || { id: "", email: "Unknown" },
    };
  },

  async getByUserId(userId: string): Promise<Organization | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user?.organization) {
      return null;
    }

    return {
      id: user.organization.id,
      name: user.organization.name,
      ownerUserId: user.organization.ownerUserId,
      isActive: true,
      createdAt: user.organization.createdAt,
    };
  },

  async delete(organizationId: string): Promise<void> {
    await prisma.organization.delete({
      where: { id: organizationId },
    });
  },
};
