// app/api/file-statuses/[id]/route.ts
import { fileStatusService } from '@/features/fileStatus/fileStatus.service';
import { hasPermission, isOwner, requireAuth } from '@/lib/authMiddleware';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!isOwner(user) && !hasPermission(user, 'configureStatuses')) {
    return NextResponse.json(
      { message: 'Permission denied' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Verify status belongs to user's organization
    const status = await prisma.fileStatus.findUnique({
      where: { id: params.id },
    });

    if (!status || status.organizationId !== user!.organizationId) {
      return NextResponse.json(
        { message: 'Status not found' },
        { status: 404 }
      );
    }

    const updatedStatus = await fileStatusService.update(params.id, body);
    return NextResponse.json(updatedStatus);
  } catch (error) {
    console.error('Update file status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  if (!isOwner(user) && !hasPermission(user, 'configureStatuses')) {
    return NextResponse.json(
      { message: 'Permission denied' },
      { status: 403 }
    );
  }

  try {
    // Verify status belongs to user's organization
    const status = await prisma.fileStatus.findUnique({
      where: { id: params.id },
    });

    if (!status || status.organizationId !== user!.organizationId) {
      return NextResponse.json(
        { message: 'Status not found' },
        { status: 404 }
      );
    }

    // Check if status is in use
    const filesCount = await prisma.file.count({
      where: { currentStatusId: params.id },
    });

    if (filesCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete status in use by files' },
        { status: 400 }
      );
    }

    await fileStatusService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}