// app/api/system/organizations/route.ts
import { organizationService } from '@/features/organization/organization.service';
import { requireSystemAdmin } from '@/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, ownerEmail, ownerPassword } = body;

    if (!name || !ownerEmail || !ownerPassword) {
      return NextResponse.json(
        { message: 'Name, owner email, and password are required' },
        { status: 400 }
      );
    }

    const organization = await organizationService.create({
      name,
      ownerEmail,
      ownerPassword,
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireSystemAdmin(request);
  if (error) return error;

  try {
    const organizations = await organizationService.list();
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('List organizations error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
