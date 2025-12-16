// app/api/files/[id]/route.ts
import { fileService } from "@/features/files/file.service";
import { isOwner, requireAuth } from "@/lib/authMiddleware";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const file = await fileService.getById(id);

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    if (user.assignedLocationId && file.currentLocationId !== user.assignedLocationId) {
      return NextResponse.json({ message: "Access denied" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { currentLocationId, currentStatusId } = body;

    const { id } = await params;
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        currentStatus: true,
        currentLocation: true,
      },
    });

    if (!file || file.organizationId !== user!.organizationId) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    if (file.isCompleted && !isOwner(user)) {
      return NextResponse.json({ message: "Only organization owner can update completed files" }, { status: 403 });
    }

    if (user.assignedLocationId && file.currentLocationId !== user.assignedLocationId) {
      return NextResponse.json({ message: "Access denied" }, { status: 404 });
    }

    const locationChanged = currentLocationId !== file.currentLocationId;
    const statusChanged = currentStatusId !== file.currentStatusId;

    if (!locationChanged && !statusChanged) {
      return NextResponse.json(file);
    }

    const oldStatus = file.currentStatus;
    const oldLocation = file.currentLocation;

    let newStatus = oldStatus;
    let newLocation = oldLocation;

    if (statusChanged) {
      const status = await prisma.fileStatus.findUnique({
        where: { id: currentStatusId },
      });
      if (!status || status.organizationId !== user!.organizationId) {
        return NextResponse.json({ message: "Invalid status" }, { status: 400 });
      }
      newStatus = status;
    }

    if (locationChanged) {
      const location = await prisma.location.findUnique({
        where: { id: currentLocationId },
      });
      if (!location || location.organizationId !== user!.organizationId) {
        return NextResponse.json({ message: "Invalid location" }, { status: 400 });
      }

      newLocation = location;
    }

    await prisma.$transaction(async (tx) => {
      await tx.file.update({
        where: { id },
        data: {
          currentLocationId: newLocation.id,
          currentStatusId: newStatus.id,
          isCompleted: false,
          completedAt: null,
          updatedAt: new Date(),
        },
      });

      await tx.fileHistory.create({
        data: {
          fileId: id,
          fromLocationId: locationChanged ? oldLocation.id : null,
          toLocationId: newLocation.id,
          statusId: newStatus.id,
          locationChanged,
          statusChanged,
          oldStatusName: statusChanged ? oldStatus.name : null,
          newStatusName: statusChanged ? newStatus.name : null,
        },
      });
    });

    const updatedFile = await fileService.getById(id);
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Update file error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!isOwner(user)) {
    return NextResponse.json({ message: "Only organization owner can delete files" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file || file.organizationId !== user!.organizationId) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    await prisma.file.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
