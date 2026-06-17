import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { CreateStaffRequest, StaffUser, UpdateStaffRequest } from "./staff.types";

export const staffService = {
  async create(data: CreateStaffRequest): Promise<StaffUser> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user record
    const user = await prisma.user.create({
      data: {
        name: data.email,
        email: data.email,
        emailVerified: false,
        role: data.role,
        organizationId: data.organizationId,
        assignedLocationId: data.assignedLocationId ?? null,
        canViewAllFiles: data.canViewAllFiles ?? false,
        canManageOffices: data.canManageOffices ?? false,
        canManageStaff: data.canManageStaff ?? false,
        canConfigureStatuses: data.canConfigureStatuses ?? false,
        canManageLocations: data.canManageLocations ?? false,
      },
      include: { assignedLocation: true },
    });

    // Create Better Auth credential account (password stored here, not on User)
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

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      assignedLocationId: user.assignedLocationId,
      assignedLocation: user.assignedLocation,
      canViewAllFiles: user.canViewAllFiles,
      canManageOffices: user.canManageOffices,
      canManageStaff: user.canManageStaff,
      canConfigureStatuses: user.canConfigureStatuses,
      canManageLocations: user.canManageLocations,
      createdAt: user.createdAt,
    };
  },

  async update(userId: string, data: UpdateStaffRequest): Promise<StaffUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.assignedLocationId !== undefined && { assignedLocationId: data.assignedLocationId }),
        ...(data.canViewAllFiles !== undefined && { canViewAllFiles: data.canViewAllFiles }),
        ...(data.canManageOffices !== undefined && { canManageOffices: data.canManageOffices }),
        ...(data.canManageStaff !== undefined && { canManageStaff: data.canManageStaff }),
        ...(data.canConfigureStatuses !== undefined && { canConfigureStatuses: data.canConfigureStatuses }),
        ...(data.canManageLocations !== undefined && { canManageLocations: data.canManageLocations }),
      },
      include: { assignedLocation: true },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      assignedLocationId: user.assignedLocationId,
      assignedLocation: user.assignedLocation,
      canViewAllFiles: user.canViewAllFiles,
      canManageOffices: user.canManageOffices,
      canManageStaff: user.canManageStaff,
      canConfigureStatuses: user.canConfigureStatuses,
      canManageLocations: user.canManageLocations,
      createdAt: user.createdAt,
    };
  },

  async listByOrganization(organizationId: string): Promise<StaffUser[]> {
    const users = await prisma.user.findMany({
      where: { organizationId },
      include: { assignedLocation: true, organization: true },
      orderBy: { createdAt: "desc" },
    });

    return users
      .filter((user) => user.organization?.ownerUserId !== user.id)
      .map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        assignedLocationId: user.assignedLocationId,
        assignedLocation: user.assignedLocation,
        canViewAllFiles: user.canViewAllFiles,
        canManageOffices: user.canManageOffices,
        canManageStaff: user.canManageStaff,
        canConfigureStatuses: user.canConfigureStatuses,
        canManageLocations: user.canManageLocations,
        createdAt: user.createdAt,
      }));
  },

  async delete(userId: string): Promise<void> {
    await prisma.user.delete({ where: { id: userId } });
  },
};
