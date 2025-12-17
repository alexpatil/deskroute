// app/api/system/organizations/[id]/route.ts
import { organizationService } from "@/features/organization/organization.service";
import { requireSystemAdmin } from "@/lib/authMiddleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const organization = await organizationService.getById(id);

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { id } = await params;
    const organization = await organizationService.update(id, body);

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    await organizationService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete organization error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
