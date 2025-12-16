// app/api/organization/route.ts
// DEPRECATED for SYSTEM_ADMIN - Use /api/system/organizations instead
// This endpoint kept ONLY for existing owner user flows

import { organizationService } from "@/features/organization/organization.service";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Organization creation moved to system admin" }, { status: 403 });
}

export async function GET() {
  try {
    const userId = await getSession();

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role === "SYSTEM_ADMIN") {
      return NextResponse.json({ message: "System admins have no organization" }, { status: 403 });
    }

    const organization = await organizationService.getByUserId(userId);

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
