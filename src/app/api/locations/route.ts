import { locationService } from "@/features/locations/location.service";
import { hasPermission, isOwner, requireAuth } from "@/lib/authMiddleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!isOwner(user) && !hasPermission(user, "manageLocations")) {
    return NextResponse.json({ message: "Permission denied" }, { status: 403 });
  }

  try {
    if (!user!.organizationId) {
      return NextResponse.json({ message: "No organization found" }, { status: 403 });
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
    }

    const location = await locationService.create({
      name,
      type,
      organizationId: user!.organizationId,
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Create location error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    if (!user!.organizationId) {
      return NextResponse.json({ message: "No organization found" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? undefined;

    const locations = await locationService.listByOrganization(user!.organizationId, type);

    return NextResponse.json(locations);
  } catch (error) {
    console.error("List locations error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
