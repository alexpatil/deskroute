// app/api/auth/me/route.ts
import { authService } from '@/features/auth/auth.service';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await getSession();

    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      hasOrganization: !!user.organizationId,
      isOwner: user.isOwner,
      isSystemAdmin: user.role === 'SYSTEM_ADMIN',
      assignedLocationId: user.assignedLocationId,
      canViewAllFiles: user.canViewAllFiles,
      canManageOffices: user.canManageOffices,
      canManageStaff: user.canManageStaff,
      canConfigureStatuses: user.canConfigureStatuses,
      canManageLocations: user.canManageLocations,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}