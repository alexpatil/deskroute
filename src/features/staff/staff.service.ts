import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import type { CreateStaffRequest, StaffUser, UpdateStaffRequest } from "./staff.types";

export const staffService = {
  async create(data: CreateStaffRequest): Promise<StaffUser> {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        organizationId: data.organizationId,
        assignedLocationId: data.assignedLocationId,
        canViewAllFiles: data.canViewAllFiles ?? false,
        canManageOffices: data.canManageOffices ?? false,
        canManageStaff: data.canManageStaff ?? false,
        canConfigureStatuses: data.canConfigureStatuses ?? false,
        canManageLocations: data.canManageLocations ?? false,
      },
      include: {
        assignedLocation: true,
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
      include: {
        assignedLocation: true,
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

  async listByOrganization(organizationId: string): Promise<StaffUser[]> {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
      },
      include: {
        assignedLocation: true,
        organization: true,
      },
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
    await prisma.user.delete({
      where: { id: userId },
    });
  },
};
