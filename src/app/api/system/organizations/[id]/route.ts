// app/api/system/organizations/[id]/route.ts
import { organizationService } from '@/features/organization/organization.service';
import { requireSystemAdmin } from '@/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const organization = await organizationService.getById(params.id);

    if (!organization) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const organization = await organizationService.update(params.id, body);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Update organization error:', error);
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
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    await organizationService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}