// app/api/files/[id]/complete/route.ts
import { requireAuth } from "@/lib/authMiddleware";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
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

    // Location-scoped staff (without "view all files") can only act on files at
    // their assigned office — consistent with the GET/PUT handlers.
    if (
      user!.role === "STAFF" &&
      !user!.canViewAllFiles &&
      user!.assignedLocationId &&
      file.currentLocationId !== user!.assignedLocationId
    ) {
      return NextResponse.json({ message: "Access denied" }, { status: 404 });
    }

    if (file.isCompleted) {
      return NextResponse.json({ message: "File is already completed" }, { status: 400 });
    }

    await prisma.file.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete file error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
