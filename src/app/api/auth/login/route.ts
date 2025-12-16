// app/api/auth/login/route.ts
import { authService } from '@/features/auth/auth.service';
import { setSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authService.login({ email, password });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await setSession(user.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      hasOrganization: !!user.organizationId,
      isOwner: user.isOwner,
      isSystemAdmin: user.role === 'SYSTEM_ADMIN',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}