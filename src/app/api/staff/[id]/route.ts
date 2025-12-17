import { staffService } from "@/features/staff/staff.service";
import { requireOwner } from "@/lib/authMiddleware";
import prisma from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { id } = await params;
    // Verify staff belongs to owner's organization
    const staffUser = await prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!staffUser || staffUser.organizationId !== user!.organizationId) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    // Prevent modifying owner
    if (staffUser.organization?.ownerUserId === staffUser.id) {
      return NextResponse.json({ message: "Cannot modify owner" }, { status: 403 });
    }

    const updatedStaff = await staffService.update(id, body);
    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error("Update staff error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const { id } = await params;
    // Verify staff belongs to owner's organization
    const staffUser = await prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!staffUser || staffUser.organizationId !== user!.organizationId) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    // Prevent deleting owner
    if (staffUser.organization?.ownerUserId === staffUser.id) {
      return NextResponse.json({ message: "Cannot delete owner" }, { status: 403 });
    }

    await staffService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete staff error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
