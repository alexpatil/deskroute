// lib/authMiddleware.ts
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

const SYSTEM_ADMIN_EMAILS = process.env.SYSTEM_ADMIN_EMAILS?.split(",") || [];

export async function requireAuth(request: NextRequest) {
  const userId = await getSession();

  if (!userId) {
    return { error: NextResponse.json({ message: "Not authenticated" }, { status: 401 }), user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true, assignedLocation: true },
  });

  if (!user) {
    return { error: NextResponse.json({ message: "User not found" }, { status: 404 }), user: null };
  }

  return { user, error: null };
}

export async function requireOwner(request: NextRequest) {
  const { user, error } = await requireAuth(request);

  if (error) return { error, user: null };

  if (!user?.organization || user.organization.ownerUserId !== user.id) {
    return {
      error: NextResponse.json({ message: "Owner access required" }, { status: 403 }),
      user: null,
    };
  }

  return { user, error: null };
}

export async function requireSystemAdmin(request: NextRequest) {
  const { user, error } = await requireAuth(request);

  if (error) return { error, user: null };

  if (user?.role !== "SYSTEM_ADMIN") {
    return {
      error: NextResponse.json({ message: "System admin access required" }, { status: 403 }),
      user: null,
    };
  }

  if (SYSTEM_ADMIN_EMAILS.length > 0 && !SYSTEM_ADMIN_EMAILS.includes(user.email)) {
    return {
      error: NextResponse.json({ message: "Unauthorized system admin" }, { status: 403 }),
      user: null,
    };
  }

  return { user, error: null };
}

export function isOwner(user: any): boolean {
  return user?.organization?.ownerUserId === user?.id;
}

export function isSystemAdmin(user: any): boolean {
  if (user?.role !== "SYSTEM_ADMIN") return false;
  if (SYSTEM_ADMIN_EMAILS.length > 0) {
    return SYSTEM_ADMIN_EMAILS.includes(user.email);
  }
  return true;
}

export function hasPermission(user: any, permission: keyof PermissionMap): boolean {
  // System admin has NO org-level permissions
  if (user.role === "SYSTEM_ADMIN") return false;

  const permissionMap: PermissionMap = {
    viewAllFiles: "canViewAllFiles",
    manageOffices: "canManageOffices",
    manageStaff: "canManageStaff",
    configureStatuses: "canConfigureStatuses",
    manageLocations: "canManageLocations",
  };

  const key = permissionMap[permission];
  return key ? user[key] === true : false;
}

type PermissionMap = {
  viewAllFiles: "canViewAllFiles";
  manageOffices: "canManageOffices";
  manageStaff: "canManageStaff";
  configureStatuses: "canConfigureStatuses";
  manageLocations: "canManageLocations";
};
