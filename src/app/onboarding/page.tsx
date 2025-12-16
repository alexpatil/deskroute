// app/onboarding/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          Organization Setup Disabled
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-textMuted)' }}>
          Organizations must be created by a system administrator.
        </p>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          Redirecting to login...
        </p>
      </div>
    </div>
  );
}