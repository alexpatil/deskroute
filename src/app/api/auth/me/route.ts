import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isOwner = user.organization?.ownerUserId === user.id;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      hasOrganization: !!user.organizationId,
      isOwner,
      isSystemAdmin: user.role === "SYSTEM_ADMIN",
      assignedLocationId: user.assignedLocationId,
      canViewAllFiles: user.canViewAllFiles,
      canManageOffices: user.canManageOffices,
      canManageStaff: user.canManageStaff,
      canConfigureStatuses: user.canConfigureStatuses,
      canManageLocations: user.canManageLocations,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
