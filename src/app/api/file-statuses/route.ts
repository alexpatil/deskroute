import { fileStatusService } from '@/features/fileStatus/fileStatus.service';
import { hasPermission, isOwner, requireAuth } from '@/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!isOwner(user) && !hasPermission(user, 'configureStatuses')) {
    return NextResponse.json(
      { message: 'Permission denied' },
      { status: 403 }
    );
  }

  try {
    if (!user!.organizationId) {
      return NextResponse.json(
        { message: 'No organization found' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    const status = await fileStatusService.create({
      name,
      organizationId: user!.organizationId,
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('Create file status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    if (!user!.organizationId) {
      return NextResponse.json(
        { message: 'No organization found' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get('enabledOnly') === 'true';

    const statuses = await fileStatusService.listByOrganization(
      user!.organizationId,
      enabledOnly
    );

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('List file statuses error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}