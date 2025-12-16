import { staffService } from '@/features/staff/staff.service';
import { requireOwner } from '@/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { email, password, role, assignedLocationId, ...permissions } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!user!.organizationId) {
      return NextResponse.json(
        { message: 'No organization found' },
        { status: 403 }
      );
    }

    const staff = await staffService.create({
      email,
      password,
      role: role as 'STAFF' | 'ADMIN',
      organizationId: user!.organizationId,
      assignedLocationId: assignedLocationId || undefined,
      ...permissions,
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireOwner(request);
  if (error) return error;

  try {
    if (!user!.organizationId) {
      return NextResponse.json(
        { message: 'No organization found' },
        { status: 403 }
      );
    }

    const staff = await staffService.listByOrganization(user!.organizationId);
    return NextResponse.json(staff);
  } catch (error) {
    console.error('List staff error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}