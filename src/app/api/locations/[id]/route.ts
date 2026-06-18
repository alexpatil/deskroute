// app/api/locations/[id]/route.ts
import { locationService } from "@/features/locations/location.service";
import { hasPermission, isOwner, requireAuth } from "@/lib/authMiddleware";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const location = await locationService.getById(id);
    if (!location || location.organizationId !== user!.organizationId) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }
    return NextResponse.json(location);
  } catch (error) {
    console.error("Get location error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!isOwner(user) && !hasPermission(user, "manageLocations")) {
    return NextResponse.json({ message: "Permission denied" }, { status: 403 });
  }

  try {
    // Verify location belongs to user's organization
    const { id } = await params;
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location || location.organizationId !== user!.organizationId) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }

    // Check if location has assigned users
    const assignedUsers = await prisma.user.count({
      where: { assignedLocationId: id },
    });

    if (assignedUsers > 0) {
      return NextResponse.json({ message: "Cannot delete location with assigned staff" }, { status: 400 });
    }

    // Check if location has files
    const filesCount = await prisma.file.count({
      where: { currentLocationId: id },
    });

    if (filesCount > 0) {
      return NextResponse.json({ message: "Cannot delete location with files" }, { status: 400 });
    }

    await locationService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete location error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
