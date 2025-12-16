// features/auth/auth.service.ts
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import type { AuthUser, LoginRequest } from "./auth.types";

export const authService = {
  async login(data: LoginRequest): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true },
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    const isOwner = user.organization?.ownerUserId === user.id;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      assignedLocationId: user.assignedLocationId,
      canViewAllFiles: user.canViewAllFiles,
      canManageOffices: user.canManageOffices,
      canManageStaff: user.canManageStaff,
      canConfigureStatuses: user.canConfigureStatuses,
      canManageLocations: user.canManageLocations,
      isOwner,
    };
  },

  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) return null;

    const isOwner = user.organization?.ownerUserId === user.id;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      assignedLocationId: user.assignedLocationId,
      canViewAllFiles: user.canViewAllFiles,
      canManageOffices: user.canManageOffices,
      canManageStaff: user.canManageStaff,
      canConfigureStatuses: user.canConfigureStatuses,
      canManageLocations: user.canManageLocations,
      isOwner,
    };
  },
};
