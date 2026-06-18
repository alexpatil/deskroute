// app/api/organization/route.ts
import { auth } from "@/lib/auth";
import { organizationService } from "@/features/organization/organization.service";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, logoUrl, primaryContact, country, timezone } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: "Organization name is required" }, { status: 400 });
    }

    const organization = await organizationService.createForUser(session.user.id, {
      name: name.trim(),
      type,
      logoUrl,
      primaryContact,
      country,
      timezone,
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (user?.role === "SYSTEM_ADMIN") {
      return NextResponse.json({ message: "System admins have no organization" }, { status: 403 });
    }

    const organization = await organizationService.getByUserId(session.user.id);

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
