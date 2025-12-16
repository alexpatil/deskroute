// app/api/files/route.ts
import { fileService } from "@/features/files/file.service";
import { requireAuth } from "@/lib/authMiddleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!user?.organizationId) {
    return NextResponse.json({ message: "No organization found" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { clientName, serviceType, currentLocationId, currentStatusId } = body;

    if (!clientName || !serviceType || !currentLocationId || !currentStatusId) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (user.role === "STAFF") {
      if (!user.assignedLocationId) {
        return NextResponse.json({ message: "No location assigned" }, { status: 403 });
      }

      if (user.assignedLocationId !== currentLocationId) {
        return NextResponse.json({ message: "Can only create files at your assigned location" }, { status: 403 });
      }
    }

    const file = await fileService.create({
      clientName,
      serviceType,
      currentLocationId,
      currentStatusId,
      organizationId: user.organizationId,
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("Create file error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!user?.organizationId) {
    return NextResponse.json({ message: "No organization found" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") as "active" | "completed" | undefined;

    let locationId: string | undefined;

    if (user.role === "STAFF") {
      if (!user.assignedLocationId) {
        return NextResponse.json({ message: "No location assigned" }, { status: 403 });
      }
      locationId = user.assignedLocationId;
    }

    const files = await fileService.listByOrganization(user.organizationId, filter, locationId);

    return NextResponse.json(files);
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
