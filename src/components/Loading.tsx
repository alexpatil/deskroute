// components/Loading.tsx

function Spinner({ size = 40, stroke = 3, color = "var(--color-primary)" }: { size?: number; stroke?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 50 50' className='animate-spin'>
      <circle
        cx='25'
        cy='25'
        r='20'
        fill='none'
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap='round'
        strokeDasharray='90 150'
        strokeDashoffset='0'
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className='min-h-screen flex items-center justify-center' style={{ backgroundColor: "var(--color-background)" }}>
      <Spinner size={48} stroke={4} />
    </div>
  );
}
export function SectionLoader() {
  return (
    <div className='flex justify-center py-8'>
      <div
        className='w-6 h-6 rounded-full animate-spin'
        style={{
          border: "2px solid var(--color-primary)",
          borderTopColor: "transparent",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div
      className='w-4 h-4 rounded-full animate-spin'
      style={{
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        opacity: 0.8,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className='rounded-xl p-4' style={{ backgroundColor: "var(--color-surface)" }}>
      <div className='flex justify-between mb-3'>
        <SkeletonLine width='33%' />
        <SkeletonLine width='64px' />
      </div>

      <SkeletonLine width='66%' className='mb-2' />
      <SkeletonLine width='50%' />
    </div>
  );
}

function SkeletonLine({ width, className = "" }: { width: string; className?: string }) {
  return (
    <div
      className={`h-4 rounded-md ${className}`}
      style={{
        width,
        background: "linear-gradient(90deg, var(--color-borderLight) 25%, var(--color-border) 37%, var(--color-borderLight) 63%)",
        backgroundSize: "400% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
      }}
    />
  );
}
