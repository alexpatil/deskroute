import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

const SYSTEM_ADMIN_EMAILS = process.env.SYSTEM_ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];

export async function requireAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return { error: NextResponse.json({ message: "Not authenticated" }, { status: 401 }), user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
  if (SYSTEM_ADMIN_EMAILS.length > 0) return SYSTEM_ADMIN_EMAILS.includes(user.email);
  return true;
}

type PermissionKey = "viewAllFiles" | "manageStaff" | "configureStatuses" | "manageLocations";

const PERMISSION_MAP: Record<PermissionKey, string> = {
  viewAllFiles: "canViewAllFiles",
  manageStaff: "canManageStaff",
  configureStatuses: "canConfigureStatuses",
  manageLocations: "canManageLocations",
};

export function hasPermission(user: any, permission: PermissionKey): boolean {
  if (user?.role === "SYSTEM_ADMIN") return false;
  const field = PERMISSION_MAP[permission];
  return field ? user[field] === true : false;
}
